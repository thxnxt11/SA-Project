import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../../component/layout/navbar";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Row,
  Space,
  message,
  Spin,
} from "antd";
import { FaCircleCheck } from "react-icons/fa6"; // ✅ เลือก
import { RxCrossCircled } from "react-icons/rx"; // ❌ จองแล้ว
import { TbTicket } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "../../../component/loader/loader";
import { seatAPI } from "../../../services/https";

type SeatFromAPI = {
  id: number;
  code: string;
  row: string;
  number: number;
  status: string;
};

type SeatCell = {
  id: string; // unique สำหรับ key
  seatId: number;
  seatNumber: string;
  code: string; // รหัสที่นั่ง เช่น "A1", "B2"
  status: "available" | "booked" | "locked";
};

type SeatRow = {
  row: string; // "A","B",...
  seats: SeatCell[];
};

const thb = new Intl.NumberFormat("th-TH");

const normalizeStatus = (
  s?: string | null
): "available" | "booked" | "locked" => {
  const v = (s ?? "").trim().toLowerCase();

  if (v === "booked") return "booked";
  else if (v === "locked") return "locked";
  else return "available";
};

// สร้างกริดที่นั่งจาก SeatFromAPI[]
const buildSeatGrid = (items: SeatFromAPI[]): SeatRow[] => {
  const cells: (SeatCell & { row: string })[] = items.map((it) => {
    const status = normalizeStatus(it.status);

    return {
      id: `${it.id}-${it.code}`,
      seatId: it.id,
      seatNumber: it.number.toString(),
      code: it.code, // เก็บ code สำหรับแสดงใน selectedSeats
      status,
      row: it.row,
    };
  });

  // group by row
  const map = new Map<string, SeatCell[]>();
  cells.forEach((c) => {
    if (!map.has(c.row)) map.set(c.row, []);
    map.get(c.row)!.push({
      id: c.id,
      seatId: c.seatId,
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
      seats: arr.sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber)),
    }));
};

const SelectSeat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showDate, showTime, zoneName, zonePrice, zoneType, zoneId } =
    location.state || {};

  // Standing zone: เริ่มเลือกไว้ 1 ใบแบบเหมารวม
  const [selectedSeats, setSelectedSeats] = useState<string[]>(() => {
    const isStanding = (zoneType ?? "").toLowerCase() === "standing";
    return isStanding ? ["Standing"] : [];
  });

  // โหลดที่นั่งจาก DB
  const [loading, setLoading] = useState(false);
  const [seatRows, setSeatRows] = useState<SeatRow[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

useEffect(() => {
  const isStanding = (zoneType ?? "").toLowerCase() === "standing";

  if (!zoneId || isStanding) {
    setSeatRows([]);
    setLoading(false);
    setApiError(null);
    return;
  }

  const abort = new AbortController();

  const fetchSeats = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await seatAPI.getByZoneId(zoneId);

      if (abort.signal.aborted) return;
      if (!res || (res.status && res.status !== 200)) {
        throw new Error(
          `HTTP ${res?.status || "Unknown"} ${res?.statusText || "Error"}`
        );
      }
      
      const data = res.data || res;
      const items: SeatFromAPI[] = Array.isArray(data) ? data : [];
      console.log("Seat: ", data);

      const grid = buildSeatGrid(items);
      if (!abort.signal.aborted) setSeatRows(grid);
    } catch (e) {
      if (!abort.signal.aborted) {
        console.error("Fetch seats error:", e);
        setApiError("ไม่สามารถโหลดผังที่นั่งได้");
      }
    } finally {
      if (!abort.signal.aborted) setLoading(false);
    }
  };

  fetchSeats();
  return () => abort.abort();
}, [zoneId, zoneType]);

  // เลือก/ยกเลิกเลือก seat (จำกัดสูงสุด 2)
  const handleSeatClick = (seatCode: string, status: string) => {
    if (status === "available") {
      setSelectedSeats((prevSelected) => {
        if (prevSelected.includes(seatCode)) {
          return prevSelected.filter((code) => code !== seatCode); // ยกเลิกเลือก
        } else if (prevSelected.length < 2) {
          return [...prevSelected, seatCode]; // เลือกใหม่
        } else {
          message.warning("สามารถเลือกได้สูงสุด 2 ที่นั่ง");
          return prevSelected;
        }
      });
    }
  };

  const [loadingBooking, setLoadingBooking] = useState(false);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);

  const handleBooking = () => {
    setLoadingBooking(true);
    setTimeout(() => {
      setLoadingBooking(false);
      setShowFullScreenLoader(true);
      setTimeout(() => {
        navigate("/bookingdetail", {
          state: {
            showDate,
            showTime,
            zone: zoneName,
            seatNo: displaySeatNo,
            quantity: displayQuantity,
            unitPrice: zonePrice,
          },
        });
      }, 1200);
    }, 1200);
  };

  const handleCancel = () => navigate(-1);

  const displayQuantity = useMemo(
    () =>
      (zoneType ?? "").toLowerCase() === "standing" ? 1 : selectedSeats.length,
    [zoneType, selectedSeats.length]
  );

  const displaySeatNo = useMemo(
    () =>
      (zoneType ?? "").toLowerCase() === "standing"
        ? "Standing"
        : selectedSeats.join(", "),
    [zoneType, selectedSeats]
  );

  const totalPrice = (zonePrice || 0) * displayQuantity;

  const dividerStyle: React.CSSProperties = {
    borderColor: "#d3d3d3ff",
    margin: "10px 0",
  };

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
          {/* โซนนั่ง: แสดงผังที่นั่งจาก DB */}
          {(zoneType ?? "").toLowerCase() !== "standing" && (
            <Col>
              <Card
                style={{
                  width: 1200,
                  minHeight: 400,
                  borderColor: "#d3d3d3ff",
                  backgroundColor: "#F6F6F8",
                  borderRadius: 15,
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                <>
                  <div
                    style={{
                      backgroundColor: "#ffffffff",
                      height: "70px",
                      width: "60%",
                      margin: "0 auto 40px auto",
                      borderRadius: "10px 10px 0 0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "black",
                      fontSize: "20px",
                      fontWeight: "bold",
                      border: "1px solid black",
                    }}
                  >
                    STAGE
                  </div>

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
                  ) : apiError ? (
                    <p style={{ textAlign: "center", color: "#c00" }}>
                      {apiError}
                    </p>
                  ) : seatRows.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#666" }}>
                      No seats found.
                    </p>
                  ) : (
                    <div
                      style={{
                        overflowY: "auto",
                        paddingRight: "15px",
                      }}
                    >
                      {seatRows.map((rowObj) => (
                        <div
                          key={rowObj.row}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "10px",
                          }}
                        >
                          {/* Left Row Label */}
                          <div
                            style={{
                              width: "30px",
                              textAlign: "center",
                              fontSize: "24px",
                              fontWeight: "bold",
                              marginRight: "30px",
                              color: "#000",
                            }}
                          >
                            {rowObj.row}
                          </div>

                          {/* Seats */}
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                              justifyContent: "center",
                            }}
                          >
                            {rowObj.seats.map((seat) => {
                              const isSelected = selectedSeats.includes(
                                seat.code
                              );
                              return (
                                <Card
                                  key={seat.id}
                                  onClick={() =>
                                    handleSeatClick(seat.code, seat.status)
                                  }
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    position: "relative",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor:
                                      seat.status === "available"
                                        ? "pointer"
                                        : "not-allowed",
                                    backgroundColor:
                                      seat.status === "booked"
                                        ? "white"
                                        : isSelected
                                        ? "#ffffffff"
                                        : "#2c48ffff",
                                    borderColor:
                                      seat.status === "booked"
                                        ? "#333"
                                        : isSelected
                                        ? "#00b60fff"
                                        : "#333",
                                    borderWidth: "2px",
                                    borderStyle: "solid",
                                    transition: "all 0.6s ease",
                                    flexShrink: 0,
                                  }}
                                >
                                  {seat.status === "booked" ? (
                                    <RxCrossCircled
                                      style={{
                                        fontSize: "46px",
                                        color: "#ff0000ff",
                                        display: "flex",
                                        justifyItems: "center",
                                      }}
                                    />
                                  ) : isSelected ? (
                                    <FaCircleCheck
                                      style={{
                                        fontSize: "40px",
                                        color: "#00b60fff",
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    />
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                        color: "white",
                                      }}
                                    >
                                      {seat.seatNumber}
                                    </span>
                                  )}
                                </Card>
                              );
                            })}
                          </div>

                          {/* Right Row Label */}
                          <div
                            style={{
                              width: "30px",
                              textAlign: "center",
                              fontSize: "24px",
                              fontWeight: "bold",
                              marginLeft: "30px",
                              color: "#333",
                            }}
                          >
                            {rowObj.row}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Legend */}
                  <Divider style={{ borderColor: "#d3d3d3ff" }} />
                  <div style={{ marginTop: "5px", textAlign: "center" }}>
                    <FaCircleCheck
                      style={{
                        color: "#00b60fff",
                        fontSize: "18px",
                        marginRight: "8px",
                        verticalAlign: "middle",
                      }}
                    />{" "}
                    Selected
                    <RxCrossCircled
                      style={{
                        backgroundColor: "#ffffffff",
                        borderRadius: "50%",
                        color: "#ff0000ff",
                        fontSize: "20px",
                        marginLeft: "20px",
                        marginRight: "8px",
                        verticalAlign: "middle",
                      }}
                    />{" "}
                    Booked
                    <span
                      style={{
                        display: "inline-block",
                        width: "20px",
                        height: "20px",
                        backgroundColor: "#000000ff",
                        borderRadius: "50%",
                        marginLeft: "20px",
                        marginRight: "10px",
                        border: "1px solid #333",
                        verticalAlign: "middle",
                      }}
                    ></span>{" "}
                    Available
                  </div>
                </>
              </Card>
            </Col>
          )}

          {/* ใบสรุปตั๋ว */}
          {((zoneType ?? "").toLowerCase() === "standing" ||
            selectedSeats.length > 0) && (
            <div>
              <Col xs={24} style={{ marginLeft: "21px" }}>
                <Card
                  style={{
                    width: 1200,
                    marginTop: "24px",
                    borderColor: "#d3d3d3ff",
                    backgroundColor: "#F6F6F8",
                    borderRadius: 15,
                    padding: "15px",
                    textAlign: "left",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {/* Title */}
                  <h1
                    style={{
                      position: "absolute",
                      top: 15,
                      margin: 0,
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <TbTicket style={{ fontSize: "130%" }} />
                    Ticket Information
                  </h1>

                  <Divider
                    style={{
                      borderColor: "#d3d3d3ff",
                      marginTop: "40px",
                      marginBottom: "10px",
                    }}
                  />

                  <Row
                    gutter={[0, 3]}
                    style={{ fontSize: "24px" }}
                    align="middle"
                  >
                    <Col span={12} style={{ fontSize: "18px" }}>
                      ShowDate:
                    </Col>
                    <Col span={12} style={{ fontSize: "18px" }}>
                      <strong>{showDate}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={{ fontSize: "18px" }}>
                      ShowTime:
                    </Col>
                    <Col span={12} style={{ fontSize: "18px" }}>
                      <strong>{showTime}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={{ fontSize: "18px" }}>
                      Zone:
                    </Col>
                    <Col span={12} style={{ fontSize: "18px" }}>
                      <strong>{zoneName}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={{ fontSize: "18px" }}>
                      Seat No:
                    </Col>
                    <Col span={12} style={{ fontSize: "18px" }}>
                      <strong>{displaySeatNo}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={{ fontSize: "18px" }}>
                      Quantity:
                    </Col>
                    <Col span={12} style={{ fontSize: "18px" }}>
                      <strong>{displayQuantity}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={{ fontSize: "18px" }}>
                      Unit Price (THB):
                    </Col>
                    <Col span={12} style={{ fontSize: "18px" }}>
                      <strong>฿ {thb.format(zonePrice || 0)}</strong>
                    </Col>
                    <Divider style={dividerStyle} />

                    <Col span={12} style={{ fontSize: "18px" }}>
                      Total Price (THB):
                    </Col>
                    <Col span={12} style={{ fontSize: "18px" }}>
                      <strong>฿ {totalPrice}</strong>
                    </Col>
                    <Divider style={dividerStyle} />
                  </Row>
                </Card>
              </Col>

              <Row
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 30,
                }}
              >
                <Form.Item>
                  <Space size={30}>
                    <Button
                      onClick={handleCancel}
                      type="default"
                      size="large"
                      style={{
                        height: 48,
                        fontSize: 20,
                        padding: "0 24px",
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="primary"
                      onClick={handleBooking}
                      loading={loadingBooking}
                      size="large"
                      style={{
                        height: 48,
                        fontSize: 20,
                        padding: "0 24px",
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      Booking
                    </Button>
                    {showFullScreenLoader && <Loader />}
                  </Space>
                </Form.Item>
              </Row>
            </div>
          )}
        </Row>
      </div>
    </>
  );
};

export default SelectSeat;
