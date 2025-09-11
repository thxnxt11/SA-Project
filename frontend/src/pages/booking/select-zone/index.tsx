import React, { useEffect, useMemo, useState } from "react";
import {Col, message, Spin, Grid, Row } from "antd";
import type { RadioChangeEvent } from "antd";
import Navbar from "../../../component/layout/navbar";
import chart from "../../../assets/chart.svg";

import type { ZoneInterface } from "../../../interface/zone";
import type { ConcertInterface } from "../../../interface/concert";
import type { ShowDatesInterface } from "../../../interface/showdate";
import { concertAPI, ShowDateAPI } from "../../../services/https";
import { useNavigate, useParams } from "react-router-dom";

import ConcertChartCard from "../../../component/booking/concertChartGard";
import ShowDateSelector from "../../../component/booking/showdateSelect";
import ZoneList from "../../../component/booking/zoneList";

const { useBreakpoint } = Grid;

const zonePriceNumber = (z: ZoneInterface) => Number(z.zone_price ?? 0);
const zoneNameText = (z: ZoneInterface) => z.zone_name || "Zone";
const zoneTypeText = (z: ZoneInterface) => z.zone_type || "—";

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
    if (!sd) return message.warning("กรุณาเลือกวันที่ก่อน");

    const available =
      typeof zone.available_count === "number"
        ? zone.available_count
        : Math.max(
            0,
            (zone.capacity || 0) -
              (zone.seat_sold || 0) -
              (zone.pending_holds || 0)
          );

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
            <ConcertChartCard
              chartImage={concert?.chart_image}
              fallbackSrc={chart}
            />
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
              <ShowDateSelector
                showDates={showDates}
                selectedShowDateId={selectedShowDateId}
                onChange={onShowDateChange}
              />

              {selectedShowDateId && (
                <ZoneList
                  zones={zonesForSelectedDate}
                  selectedShowDate={selectedShowDate}
                  onZoneClick={handleZoneCardClick}
                />
              )}
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default SelectZone;
