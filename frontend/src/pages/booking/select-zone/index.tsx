import React, { useEffect, useMemo, useState } from "react";
import type { RadioChangeEvent } from "antd";
import Navbar from "../../../component/layout/navbar";
import { Card, Col, Radio, message, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import chart from "../../../assets/chart.svg";
import type { ZoneInterface } from "../../../interface/zone";
import type { ConcertInterface } from "../../../interface/concert";
import type { ShowDatesInterface } from "../../../interface/showdate";
import { concertAPI, ShowDateAPI } from "../../../services/https";

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

// แปลงวันที่แบบอ่านง่าย "15 November 2025" 
const formatDateLong = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";

  return d
    .toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
};

// คำนวณจำนวนที่นั่งว่างตาม service 
const calcAvailableSeats = (zone: ZoneInterface): number => {
  // ใช้ available_count ที่ส่งมาจาก backend โดยตรง 
  if (typeof zone.available_count === "number") {
    return zone.available_count;
  }

  // fallback: คำนวณเองถ้า backend ยังไม่ส่ง available_count มา
  if (zone.capacity) {
    const capacity = zone.capacity;
    const sold = zone.seat_sold || 0;
    const holds = zone.pending_holds || 0;
    const available = capacity - sold - holds;
    return Math.max(0, available);
  }

  // ถ้าไม่มีข้อมูลอะไรเลย
  return 0;
};

// ดึงชื่อโซน + ราคา
const zonePriceNumber = (z: ZoneInterface): number => Number(z.zone_price ?? 0);

const zoneNameText = (z: ZoneInterface): string => {
  if (z.zone_name) return z.zone_name;
  return "Zone";
};

const zoneTypeText = (z: ZoneInterface): string => {
  if (z.zone_type) {
    return z.zone_type;
  }
  return "—";
};

const AVAILABLE_BG = "#22c55e"; // green
const SOLDOUT_BG = "#ef4444";

const SelectZone: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // /concert/:id/selectzone
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [concert, setConcert] = useState<ConcertInterface | null>(null);

  // state แยกสำหรับ zones ของ showdate ที่เลือก
  const [selectedZones, setSelectedZones] = useState<ZoneInterface[]>([]);

  // state ของวันแสดงที่เลือก
  const [selectedShowDateId, setSelectedShowDateId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        message.error("ไม่พบคอนเสิร์ต");
        navigate("/");
        return;
      }

      setLoading(true);
      try {
        const response = await concertAPI.getById(Number(id));

        // ตรวจสอบว่า response สำเร็จหรือไม่
        if (!response || response.status !== 200) {
          throw new Error(`Failed to fetch concert: ${response?.status}`);
        }

        const data: ConcertInterface = response.data || response;
        setConcert(data);
        console.log("Raw api data:", data);
      } catch (e) {
        console.error(e);
        message.error("ไม่สามารถโหลดรายละเอียดคอนเสิร์ตได้");
      } finally {
        setLoading(false);
      }
    };

    const loadZones = async () => {
      if (!selectedShowDateId) {
        setSelectedZones([]);
        return;
      }

      try {
        const res = await ShowDateAPI.getZonesByShowDateId(selectedShowDateId);
        console.log("Zones response:", res);

        if (res.status === 200 && res.data) {
          const zones = Array.isArray(res.data.data) ? res.data.data : [];

          const normalizedZones = zones.map((zone: any) => ({
            ID: zone.id,
            zone_name: zone.zone_name,
            zone_price: zone.zone_price,
            zone_type: zone.zone_type,
            capacity: zone.capacity,
            pending_holds: zone.pending_holds,
            seat_sold: zone.seat_sold,
            available_count: zone.available_count,
            seat_available: zone.seat_available || [],
          }));

          console.log("Normalized zones:", normalizedZones);

          setSelectedZones(normalizedZones);
        }
      } catch (err) {
        message.error("โหลดโซนไม่สำเร็จ");
        console.error("Error loading zones:", err);
        setSelectedZones([]);
      }
    };

    fetchDetail();

    // โหลดโซนเมื่อเลือกวันที่
    if (selectedShowDateId) {
      loadZones();
    }
  }, [id, navigate, selectedShowDateId]);

  const onShowDateChange = (e: RadioChangeEvent) => {
    const sid = e.target.value as number;
    setSelectedShowDateId(sid);
    // จะ trigger useEffect ให้โหลด zones ใหม่
  };

  // สร้างรายการ showDates (normalize)
  const showDates: ShowDatesInterface[] = useMemo(
    () => concert?.ShowDates ?? [],
    [concert]
  );

  // วันแสดงที่เลือกอยู่
  const selectedShowDate: ShowDatesInterface | undefined = useMemo(() => {
    const sid = selectedShowDateId;
    if (!sid) return undefined;
    return showDates.find((d) => d.ID === sid);
  }, [selectedShowDateId, showDates]);

  // รายการโซนของวันที่เลือก - ใช้ selectedZones แทน
  const zonesForSelectedDate: ZoneInterface[] = useMemo(() => {
    if (!selectedZones.length) return [];

    console.log("Zones for selected date:", selectedZones);

    return selectedZones
      .slice()
      .sort((a, b) => zonePriceNumber(b) - zonePriceNumber(a));
  }, [selectedZones]);

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
        venueName: concert?.venue,
        concertId: concert?.ID,
        concertInfo: concert,
        showDateId: sd.ID,
        showDate: formatDateLong(sd.show_date),
        showTime: extractTime(sd.show_date),
        zoneId: zone.ID,
        zoneName: zoneNameText(zone),
        zoneType: zoneTypeText(zone),
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
          maxHeight: 1000,
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
            style={{ width: "100%" }}
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
              const sid = d.ID!;
              return (
                <Radio
                  key={`showdate-${sid}`}
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
                      const id = zone.ID;
                      const name = zoneNameText(zone);
                      const type = zoneTypeText(zone);
                      const price = thb.format(zonePriceNumber(zone));
                      const available = calcAvailableSeats(zone);
                      const disabled = available === 0;

                      console.log("Zone object details:", {
                        zone,
                        zone_name: zone.zone_name,
                        zone_type: zone.zone_type,
                      }); // debug zone name and type

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
