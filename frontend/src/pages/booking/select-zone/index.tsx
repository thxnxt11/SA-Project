import React, { useEffect, useMemo, useState } from "react";
import type { RadioChangeEvent } from "antd";
import Navbar from "../../../component/layout/navbar";
import { Card, Col, Radio, message, Spin, Grid, Row } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import chart from "../../../assets/chart.svg";
import type { ZoneInterface } from "../../../interface/zone";
import type { ConcertInterface } from "../../../interface/concert";
import type { ShowDatesInterface } from "../../../interface/showdate";
import { concertAPI, ShowDateAPI } from "../../../services/https";

const { useBreakpoint } = Grid;

const thb = new Intl.NumberFormat("th-TH");

const extractTime = (raw?: string): string => {
  if (!raw) return "—";
  const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

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

const calcAvailableSeats = (zone: ZoneInterface): number => {
  if (typeof zone.available_count === "number") return zone.available_count;
  if (zone.capacity) {
    const capacity = zone.capacity;
    const sold = zone.seat_sold || 0;
    const holds = zone.pending_holds || 0;
    return Math.max(0, capacity - sold - holds);
  }
  return 0;
};

const zonePriceNumber = (z: ZoneInterface): number => Number(z.zone_price ?? 0);
const zoneNameText = (z: ZoneInterface): string =>
  z.zone_name ? z.zone_name : "Zone";
const zoneTypeText = (z: ZoneInterface): string =>
  z.zone_type ? z.zone_type : "—";

const AVAILABLE_BG = "#22c55e";
const SOLDOUT_BG = "#ef4444";

const SelectZone: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [loading, setLoading] = useState(false);
  const [concert, setConcert] = useState<ConcertInterface | null>(null);
  const [selectedZones, setSelectedZones] = useState<ZoneInterface[]>([]);
  const [selectedShowDateId, setSelectedShowDateId] = useState<number | null>(
    null
  );

  const containerPadding = screens.xs
    ? 12
    : screens.sm
    ? 16
    : screens.md
    ? 20
    : 24;
  const cardSpacing = screens.xs ? 16 : screens.sm ? 20 : 24;

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
        if (!response || response.status !== 200) {
          throw new Error(`Failed to fetch concert: ${response?.status}`);
        }
        const data: ConcertInterface = response.data || response;
        setConcert(data);
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
          setSelectedZones(normalizedZones);
        }
      } catch (err) {
        message.error("โหลดโซนไม่สำเร็จ");
        console.error("Error loading zones:", err);
        setSelectedZones([]);
      }
    };

    fetchDetail();
    if (selectedShowDateId) loadZones();
  }, [id, navigate, selectedShowDateId]);

  const onShowDateChange = (e: RadioChangeEvent) =>
    setSelectedShowDateId(e.target.value as number);

  const showDates: ShowDatesInterface[] = useMemo(
    () => concert?.ShowDates ?? [],
    [concert]
  );
  const selectedShowDate: ShowDatesInterface | undefined = useMemo(() => {
    if (!selectedShowDateId) return undefined;
    return showDates.find((d) => d.ID === selectedShowDateId);
  }, [selectedShowDateId, showDates]);

  const zonesForSelectedDate: ZoneInterface[] = useMemo(() => {
    if (!selectedZones.length) return [];
    return selectedZones
      .slice()
      .sort((a, b) => zonePriceNumber(b) - zonePriceNumber(a));
  }, [selectedZones]);

  const handleZoneCardClick = (zone: ZoneInterface) => {
    const sd = selectedShowDate;
    const available = calcAvailableSeats(zone);
    if (!sd) return message.warning("กรุณาเลือกวันที่ก่อน");
    if (available <= 0) return message.warning("โซนนี้ที่นั่งไม่ว่าง");

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
            padding: containerPadding,
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
      <div
        style={{ padding: containerPadding, maxWidth: 1200, margin: "0 auto" }}
      >
        <Row gutter={[cardSpacing, cardSpacing]} justify="center" align="top">
          {/* Left: Concert Chart */}
          <Col xs={24} md={10}>
            <Card
              style={{
                width: "100%",
                borderColor: "#d3d3d3ff",
                backgroundColor: "#F6F6F8",
                borderRadius: 15,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              <h2 style={{ marginTop: -8, textAlign: "center" }}>
                Concert Chart
              </h2>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src={
                    concert?.chart_image
                      ? `http://localhost:8000${concert.chart_image}`
                      : chart
                  }
                  alt="chart"
                  style={{ width: "100%", borderRadius: 8 }}
                />
              </div>
            </Card>
          </Col>

          {/* Right: Select Date + Zones */}
          <Col xs={24} md={14}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: cardSpacing,
              }}
            >
              <Card
                style={{
                  width: "100%",
                  borderColor: "#d3d3d3ff",
                  backgroundColor: "#F6F6F8",
                  borderRadius: 15,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  maxWidth: 600,
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
                    marginTop: 12,
                  }}
                >
                  {showDates.map((d) => (
                    <Radio
                      key={`showdate-${d.ID}`}
                      value={d.ID}
                      style={{ fontSize: "18px" }}
                    >
                      Show Date: {formatDateLong(d.show_date)}{" "}
                      {extractTime(d.show_date)}
                    </Radio>
                  ))}
                </Radio.Group>
              </Card>

              {selectedShowDateId && (
                <Card
                  style={{
                    width: "100%",
                    borderColor: "#d3d3d3ff",
                    backgroundColor: "#F6F6F8",
                    borderRadius: 15,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    maxWidth: 600,
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <h1 style={{ textAlign: "center", margin: "4px 0 12px" }}>
                    Seat Available
                  </h1>
                  <div style={{ overflow: "auto", maxHeight: 520 }}>
                    <Col>
                      <div style={{ maxWidth: 540, margin: "0 auto" }}>
                        {zonesForSelectedDate.length > 0 ? (
                          zonesForSelectedDate.map((zone) => {
                            const id = zone.ID;
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
                                onClick={() =>
                                  !disabled && handleZoneCardClick(zone)
                                }
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 12,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                    }}
                                  >
                                    <span
                                      style={{ fontSize: 16, fontWeight: 700 }}
                                    >
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
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default SelectZone;
