import React, { useEffect, useMemo, useState } from "react";
import type { RadioChangeEvent } from "antd";
import Navbar from "../../../component/layout/navbar";
import { Card, Col, Radio, message, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import chart from "../../../assets/chart.svg";
import type { ZoneInterface } from "../../../interface/zone";
import type { ConcertInterface } from "../../../interface/concert";
import type { ShowDatesInterface } from "../../../interface/showdate";

// ---- Types (ยืดหยุ่นรองรับ snake_case/UpperCase) ----
// type Zone = {
// ID?: number;
// id?: number;
// zone_name?: string;
// zonePrice?: number | string;
// zone_price?: number | string;
// type?: string; // เผื่อส่งมาด้วย
// ZoneType?: { zone_type?: string } | null;
// zone_type?: { zone_type?: string } | null;

// // ที่นั่งว่าง (อาจมาจาก relation seat_available)
// seat_available?: Array<{ seatavailable_status?: string | null }> | null;
// SeatAvailable?: Array<{ SeatAvailableStatus?: string | null }> | null;

//   availableSeats?: number; // เผื่อกรณีแบ็กเอนด์คำนวณแล้ว
// };

// type ShowDate = {
//   ID?: number;
//   id?: number;
//   show_date?: string; // ISO
//   Zones?: Zone[];
//   zones?: Zone[];
// };

// type ConcertDetail = {
//   ID: number;
//   concert_name: string;
//   concert_poster_url: string;
//   chart_image?: string;
//   ShowDates?: ShowDate[];
//   show_dates?: ShowDate[];
//   venue?: any;
// };

const thb = new Intl.NumberFormat("th-TH");

// รับเวลาเป็น "HH:MM"
const extractTime = (raw?: string): string => {
  if (!raw) return "—";
  // รับทั้ง "YYYY-MM-DD HH:MM:SS" และ ISO
  const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// แปลงวันที่แบบอ่านง่าย "15 November 2025" (หรือปรับเป็น th-TH ได้)
const formatDateLong = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// คำนวณจำนวนที่นั่งว่างในโซน
const calcAvailableSeats = (zone: ZoneInterface): number => {
  if (typeof zone.availableSeats === "number") return zone.availableSeats;

  const list = zone.seat_available ?? zone.SeatAvailable ?? [];
  if (!Array.isArray(list)) return 0;

  // นับที่นั่งที่ available (ถ้า field สถานะไม่มี ให้ถือว่าทั้งหมดคือที่นั่งที่เหลือ)
  const count = list.reduce((acc, s) => {
    const st1 = (s as any)?.seatavailable_status?.toLowerCase?.();
    const st2 = (s as any)?.SeatAvailableStatus?.toLowerCase?.();
    const status = st1 ?? st2;

    if (!status) return acc + 1; // ไม่มีสถานะ -> นับว่า available
    if (["available"].includes(status)) return acc + 1;
    return acc;
  }, 0);

  return count;
};

// ดึงชื่อโซน + ราคา
const zonePriceNumber = (z: ZoneInterface): number =>
  Number(z.zone_price ?? z.zonePrice ?? 0);

const zoneNameText = (z: ZoneInterface): string =>
  z.zone_name ?? z.zone_type?.zone_type ?? z.ZoneType?.zone_type ?? "Zone";

const zoneTypeText = (z: ZoneInterface): string =>
  z.ZoneType?.zone_type ?? z.zone_type?.zone_type ?? z.type ?? "—";

const AVAILABLE_BG = "#22c55e"; // green
const SOLDOUT_BG = "#ef4444";

const SelectZone: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // /concert/:id/selectzone
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [concert, setConcert] = useState<ConcertInterface | null>(null);

  // state ของวันแสดงที่เลือก
  const [selectedShowDateId, setSelectedShowDateId] = useState<number | null>(
    null
  );

  // โหลดข้อมูลคอนเสิร์ตจากแบ็กเอนด์
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        message.error("ไม่พบคอนเสิร์ต");
        navigate("/");
        return;
      }
      setLoading(true);
      try {
        // NOTE: ให้แบ็กเอนด์รองรับ Preload ShowDates.Zones.ZoneType (+ seat_available)
        const res = await fetch(`http://localhost:8000/api/concert/${id}`);
        if (!res.ok)
          throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        const data: ConcertInterface = await res.json();
        setConcert(data);

        // ตั้งค่า default วันแรก
        const showDates = data.ShowDates ?? data.ShowDates ?? [];
        if (showDates.length > 0)
          setSelectedShowDateId(showDates[0].ID ?? showDates[0].ID ?? null);
      } catch (e) {
        console.error(e);
        message.error("โหลดข้อมูล Select Zone ไม่ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const onShowDateChange = (e: RadioChangeEvent) => {
    setSelectedShowDateId(e.target.value);
  };

  // สร้างรายการ showDates (normalize)
  const showDates: ShowDatesInterface[] = useMemo(
    () => concert?.ShowDates ?? concert?.ShowDates ?? [],
    [concert]
  );

  // วันแสดงที่เลือกอยู่
  const selectedShowDate: ShowDatesInterface | undefined = useMemo(() => {
    const sid = selectedShowDateId;
    if (!sid) return undefined;
    return showDates.find((d) => (d.ID ?? d.ID) === sid);
  }, [selectedShowDateId, showDates]);

  // รายการโซนของวันนั้น
  const zonesForSelectedDate: ZoneInterface[] = useMemo(() => {
    if (!selectedShowDate) return [];
    return (selectedShowDate.Zones ?? selectedShowDate.Zones ?? [])
      .slice()
      .sort((a, b) => zonePriceNumber(a) - zonePriceNumber(b)); // เรียงราคาต่ำ→สูง
  }, [selectedShowDate]);

  const handleZoneCardClick = (zone: ZoneInterface) => {
    const sd = selectedShowDate;
    const available = calcAvailableSeats(zone);

    if (!sd) {
      message.warning("กรุณาเลือกวันที่ก่อน");
      return;
    }
    if (available <= 0) {
      message.warning("โซนนี้ที่นั่งไม่ว่าง");
      return;
    }

    // ไปหน้าเลือกที่นั่ง พร้อมส่งข้อมูลที่จำเป็น
    navigate("/selectseat", {
      state: {
        concertId: concert?.ID,
        showDateId: sd.ID ?? sd.ID,
        showDate: sd.show_date,
        showTime: extractTime(sd.show_date),
        zoneId: zone.ID ?? zone.id,
        zoneName: zoneNameText(zone),
        zoneType:
          zone.zone_type?.zone_type ?? zone.ZoneType?.zone_type ?? zone.type,
        zonePrice: zonePriceNumber(zone),
      },
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div
          style={{
            padding: 24,
            display: "flex",
            justifyContent: "center",
            minHeight: 400,
          }}
        >
          <Spin size="large" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <Card
        style={{
          position: "absolute",
          left: 100,
          marginTop: 30,
          width: 600,
          height: 600,
          borderColor: "#d3d3d3ff",
          backgroundColor: "#F6F6F8",
          borderRadius: 15,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h2 style={{ marginTop: -8 }}>Concert Chart</h2>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {/* ถ้าอยากใช้ chart จากแบ็กเอนด์ ให้เปลี่ยนเป็น src จาก concert.chart_image */}
          <img
            src={
              concert?.chart_image
                ? `http://localhost:8000${concert.chart_image}`
                : chart
            }
            alt="chart"
            style={{ width: "90%" }}
          />
        </div>
      </Card>

      <Col
        style={{
          position: "absolute",
          right: 120,
        }}
      >
        <Card
          style={{
            marginTop: 30,
            width: 600,
            height: 180,
            borderColor: "#d3d3d3ff",
            backgroundColor: "#F6F6F8",
            borderRadius: 15,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          <h2 style={{ marginTop: -8 }}>Select Date</h2>

          <Radio.Group
            onChange={onShowDateChange}
            value={selectedShowDateId}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginLeft: 30,
            }}
          >
            {showDates.map((d) => {
              const sid = d.ID ?? d.ID!;
              return (
                <Radio
                  key={sid}
                  value={sid}
                  className="cursor-pointer"
                  style={{ fontSize: "18px" }}
                >
                  Show Date: {formatDateLong(d.show_date)}{" "}
                  {extractTime(d.show_date)}
                </Radio>
              );
            })}
          </Radio.Group>
        </Card>

        {selectedShowDateId && (
          <Card
            style={{
              marginTop: 30,
              width: 600,
              height: 600,
              marginBottom: 30,
              borderColor: "#d3d3d3ff",
              backgroundColor: "#F6F6F8",
              borderRadius: 15,
              display: "flex",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
            bodyStyle={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h1 style={{ textAlign: "center", margin: "4px 0 12px" }}>
              Seat Available
            </h1>

            <div style={{ overflow: "auto", height: "100%" }}>
              <Col>
                <div style={{ width: 540, maxWidth: "100%", margin: "0 auto" }}>
                  {zonesForSelectedDate.length > 0 ? (
                    zonesForSelectedDate.map((zone) => {
                      const id = zone.ID ?? zone.id!;
                      const name = zoneNameText(zone);
                      const type = zoneTypeText(zone);
                      const price = thb.format(zonePriceNumber(zone));
                      const available = calcAvailableSeats(zone);
                      const disabled = available === 0;

                      return (
                        <Card
                          key={id}
                          hoverable={!disabled}
                          style={{
                            borderRadius: 12,
                            margin: "8px 0",
                            cursor: disabled ? "not-allowed" : "pointer",
                            opacity: disabled ? 0.85 : 1,
                          }}
                          bodyStyle={{ padding: 12 }}
                          onClick={() => !disabled && handleZoneCardClick(zone)}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            {/* ซ้าย: ชื่อโซน + ประเภท + ราคา */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <span style={{ fontSize: 16, fontWeight: 700 }}>
                                Zone: {name}
                              </span>
                              <span
                                style={{
                                  fontSize: 14,
                                  color: "#555",
                                  fontWeight: 500,
                                }}
                              >
                                {type} - ฿{price}
                              </span>
                            </div>

                            {/* ขวา: ป้ายจำนวนที่นั่ง */}
                            <div
                              style={{
                                minWidth: 72,
                                height: 36,
                                padding: "0 12px",
                                borderRadius: 10,
                                backgroundColor: disabled
                                  ? SOLDOUT_BG
                                  : AVAILABLE_BG,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 16,
                                  fontWeight: 800,
                                  color: "white",
                                  lineHeight: 1,
                                }}
                              >
                                {available}
                              </span>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <p
                      style={{
                        textAlign: "center",
                        color: "#666",
                        marginTop: 16,
                      }}
                    >
                      No zones available for this date.
                    </p>
                  )}
                </div>
              </Col>
            </div>
          </Card>
        )}
      </Col>
    </>
  );
};

export default SelectZone;
