import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../../../component/layout/navbar";
import { Card, Col, Divider, Row, message, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../../component/loader/loader";
import { bookingAPI, seatAPI } from "../../../services/https";
import { useAuth } from "../../../hook/authContext";
import type { bookingInterface } from "../../../interface/booking";
import SeatGrid, {
  type SeatRow as SeatRowType,
} from "../../../component/booking/seatGrid";
import TicketSummary from "../../../component/booking/ticketSummary";

type SeatFromAPI = {
  id: number;
  seatid: number;
  code: string;
  row: string;
  number: number;
  status: string;
};

const thb = new Intl.NumberFormat("th-TH");

const normalizeStatus = (
  s?: string | null
): "available" | "booked" | "locked" | "unavailable" => {
  const v = (s ?? "").trim().toLowerCase();
  if (v === "booked") return "booked";
  if (v === "locked") return "locked";
  if (v === "unavailable") return "unavailable";
  return "available";
};

// สร้างกริดที่นั่งจาก SeatFromAPI[] ให้เป็นโครงสร้างที่ SeatGrid ต้องการ
const buildSeatGrid = (items: SeatFromAPI[]): SeatRowType[] => {
  const cells = items.map((it) => {
    const status = normalizeStatus(it.status);
    return {
      id: `${it.seatid}-${it.code}`,
      seatId: it.seatid,
      seatAvailableId: it.id,
      seatNumber: it.number.toString(),
      code: it.code,
      status,
      row: it.row,
    };
  });

  const map = new Map<string, any[]>();
  cells.forEach((c) => {
    if (!map.has(c.row)) map.set(c.row, []);
    map.get(c.row)!.push({
      id: c.id,
      seatId: c.seatId,
      seatAvailableId: c.seatAvailableId,
      seatNumber: c.seatNumber,
      code: c.code,
      status: c.status,
    });
  });

  return [...map.entries()]
    .sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { sensitivity: "base" })
    )
    .map(([row, arr]) => ({
      row,
      seats: arr.sort(
        (a: any, b: any) => Number(a.seatNumber) - Number(b.seatNumber)
      ),
    }));
};

const BORDER_SOFT = "#d3d3d3ff";
const CARD_BG = "#F6F6F8";

const SelectSeat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // state ที่รับมาจากหน้า select zone
  const navState = location.state || {};
  const {
    showDate,
    showTime,
    zoneName,
    zonePrice,
    zoneType,
    zoneId,
    concertInfo,
    concertId,
    showDateId,
  } = navState;

  const isStanding = (zoneType ?? "").toLowerCase() === "standing";

  // ถ้าเข้ามาโดยไม่มี context ที่จำเป็น ให้ย้อนกลับ
  useEffect(() => {
    if (!zoneId || !concertId) {
      message.warning("Missing booking context. Redirecting...");
      navigate(-1);
    }
  }, [zoneId, concertId, navigate]);

  // standing เริ่มเลือก 1 ใบ
  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    isStanding ? ["Standing"] : []
  );

  // โหลดที่นั่งจาก API
  const [loading, setLoading] = useState(false);
  const [seatRows, setSeatRows] = useState<SeatRowType[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!zoneId || isStanding) {
      setSeatRows([]);
      setLoading(false);
      setApiError(null);
      return;
    }

    let didCancel = false;

    const fetchSeats = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const res = await seatAPI.getByZoneId(zoneId);
        if (didCancel) return;

        if (!res || (res.status && res.status !== 200)) {
          throw new Error(
            `HTTP ${res?.status || "Unknown"} ${res?.statusText || "Error"}`
          );
        }
        const data = res.data || res;
        const items: SeatFromAPI[] = Array.isArray(data) ? data : [];
        const grid = buildSeatGrid(items);
        if (!didCancel) setSeatRows(grid);
      } catch (e) {
        if (!didCancel) {
          console.error("Fetch seats error:", e);
          setApiError("ไม่สามารถโหลดผังที่นั่งได้");
        }
      } finally {
        if (!didCancel) setLoading(false);
      }
    };

    fetchSeats();
    return () => {
      didCancel = true;
    };
  }, [zoneId, isStanding]);

  // เลือก/ยกเลิก seat (สูงสุด 2)
  const handleSeatClick = useCallback(
    (
      seatCode: string,
      status: "available" | "booked" | "locked" | "unavailable"
    ) => {
      if (status !== "available" || isStanding) return;
      setSelectedSeats((prev) => {
        if (prev.includes(seatCode))
          return prev.filter((code) => code !== seatCode);
        if (prev.length < 2) return [...prev, seatCode];
        message.warning("สามารถเลือกได้สูงสุด 2 ที่นั่ง");
        return prev;
      });
    },
    [isStanding]
  );

  const handleCancel = useCallback(() => navigate(-1), [navigate]);

  const displayQuantity = useMemo(
    () => (isStanding ? 1 : selectedSeats.length),
    [isStanding, selectedSeats.length]
  );

  const displaySeatNo = useMemo(
    () => (isStanding ? "Standing" : selectedSeats.join(", ")),
    [isStanding, selectedSeats]
  );

  const totalPriceNumber = Number(zonePrice || 0) * displayQuantity;
  const totalPriceText = thb.format(totalPriceNumber);

  // map code -> seatAvailableId
  const codeToId = useMemo(() => {
    const m = new Map<string, number>();
    seatRows.forEach((row) =>
      row.seats.forEach((s) => m.set(s.code, s.seatAvailableId))
    );
    return m;
  }, [seatRows]);

  // จอง
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);

  const handleBooking = useCallback(async () => {
    try {
      if (!zoneId) {
        message.error("Zone ID is missing.");
        return;
      }
      if (!showDateId) {
        message.error("ShowDate ID is missing.");
        return;
      }

      let seatIds: number[] = [];
      if (!isStanding) {
        seatIds = selectedSeats
          .map((code) => codeToId.get(code))
          .filter((v): v is number => typeof v === "number");

        if (seatIds.length !== selectedSeats.length) {
          message.error("แปลงรหัสที่นั่งเป็น seat_id ไม่ครบ");
          return;
        }
        if (seatIds.length === 0) {
          message.warning("กรุณาเลือกที่นั่งอย่างน้อย 1 ที่นั่ง");
          return;
        }
      }

      const quantity = isStanding ? 1 : seatIds.length;
      const payload: bookingInterface = {
        user_id: Number(user?.id),
        showdate_id: Number(showDateId),
        zone_id: Number(zoneId),
        queue_number: quantity,
        total_price: Number(zonePrice || 0) * quantity,
        booking_status_id: 1, // pending
        booking_date: new Date().toISOString(),
        expired_date: "", // สร้างที่ backend
      };
      if (!isStanding) payload.seat_ids = seatIds;

      setLoadingBooking(true);
      const res = await bookingAPI.create(payload);

      const isCreated = res?.status === 201 || res?.status === 200;
      if (!isCreated) {
        message.error("ที่นั่งที่คุณเลือกได้ถูกจองไปแล้ว");
        navigate(`/concert/${concertId}/selectzone`);
        return;
      }

      message.success("Booking successful!");
      setShowFullScreenLoader(true);

      const bookingData = res?.data?.data ?? res?.data ?? null;
      const bookingId = bookingData?.ID;

      setTimeout(() => {
        navigate("/bookingdetail", {
          state: {
            concertInfo,
            bookingData,
            bookingId,
            showDate,
            showTime,
            zone: zoneName,
            seatNo: displaySeatNo,
            quantity,
            unitPrice: zonePrice,
          },
        });
      }, 1500);
    } catch (err: any) {
      console.error("Create booking error:", err?.response || err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "สร้างรายการจองไม่สำเร็จ";
      message.error(msg);
    } finally {
      setLoadingBooking(false);
    }
  }, [
    zoneId,
    showDateId,
    isStanding,
    selectedSeats,
    codeToId,
    user?.id,
    zonePrice,
    concertId,
    navigate,
    concertInfo,
    showDate,
    showTime,
    zoneName,
    displaySeatNo,
  ]);

  return (
    <>
      <Navbar />
      <div
        style={{ display: "flex", justifyContent: "center", padding: "30px 0" }}
      >
        <Row
          gutter={[24, 24]}
          justify="center"
          style={{ width: "100%", maxWidth: "1200px" }}
        >
          {/* โซนนั่ง: ผังที่นั่ง + legend */}
          {!isStanding && (
            <Col>
              <Card
                style={{
                  width: 1200,
                  minHeight: 400,
                  borderColor: BORDER_SOFT,
                  backgroundColor: CARD_BG,
                  borderRadius: 15,
                  padding: 20,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                {/* STAGE bar */}
                <div
                  style={{
                    backgroundColor: "#ffffffff",
                    height: 70,
                    width: "60%",
                    margin: "0 auto 40px auto",
                    borderRadius: "10px 10px 0 0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "black",
                    fontSize: 20,
                    fontWeight: "bold",
                    border: "1px solid black",
                  }}
                >
                  STAGE
                </div>

                {/* Seat Grid */}
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: 40,
                    }}
                  >
                    <Spin size="large" />
                  </div>
                ) : (
                  <SeatGrid
                    rows={seatRows}
                    selectedCodes={selectedSeats}
                    loading={false}
                    apiError={apiError}
                    onSeatClick={handleSeatClick}
                  />
                )}

                {/* Legend */}
                <Divider style={{ borderColor: BORDER_SOFT }} />
                <div style={{ marginTop: 5, textAlign: "center" }}>
                  {/* Selected */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      marginRight: 20,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#fff",
                        border: "2px solid #fff",
                        boxShadow: "0 0 0 2px #00b60f inset",
                      }}
                    />
                    Selected
                  </span>
                  {/* Booked / Locked */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      marginRight: 20,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#fff",
                        border: "2px solid #333",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(45deg, transparent 45%, #ff0000 45%, #ff0000 55%, transparent 55%)",
                          borderRadius: "50%",
                          opacity: 0.9,
                        }}
                      />
                    </span>
                    Booked / Locked
                  </span>
                  {/* Available */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        background: "#2c48ff",
                        borderRadius: "50%",
                        border: "1px solid #fff",
                      }}
                    />
                    Available
                  </span>
                </div>
              </Card>
            </Col>
          )}

          {/* ใบสรุปตั๋ว (standing หรือ เลือกที่นั่งแล้วค่อยแสดง) */}
          {(isStanding || selectedSeats.length > 0) && (
            <TicketSummary
              showDate={showDate}
              showTime={showTime}
              zoneName={zoneName}
              displaySeatNo={displaySeatNo}
              displayQuantity={isStanding ? 1 : selectedSeats.length}
              unitPrice={Number(zonePrice || 0)}
              totalPriceText={totalPriceText}
              onCancel={handleCancel}
              onBooking={handleBooking}
              loadingBooking={loadingBooking}
              showFullScreenLoader={showFullScreenLoader}
            />
          )}
        </Row>
      </div>
      {showFullScreenLoader && <Loader />}
    </>
  );
};

export default SelectSeat;
