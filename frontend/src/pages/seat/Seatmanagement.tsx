// src/pages/zones/ZoneBrowser.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Row, Select, Space, Table, message } from "antd";

import { Seat } from "../../services/https/seat";
import type { ZoneInterface } from "../../interface/zone";
import SidebarLayout from "../../component/layout/SidebarLayout";

const normalizeId = (x: any) => x?.id ?? x?.ID;

const fmtDate = (iso?: string) => {
  if (!iso || iso.startsWith("0001-")) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    minute: "2-digit",
    hour: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

type ConcertPick = { id?: number; ID?: number; concert_name?: string; ConcertName?: string };
type ShowDatePick = { id?: number; ID?: number; show_date?: string; ShowDate?: string };

const ZoneBrowser: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [concerts, setConcerts] = useState<ConcertPick[]>([]);
  const [concertId, setConcertId] = useState<number | undefined>();

  const [showdates, setShowdates] = useState<ShowDatePick[]>([]);
  const [showdateId, setShowdateId] = useState<number | undefined>();

  const [zones, setZones] = useState<ZoneInterface[]>([]);
  const [loading, setLoading] = useState(false);

  // read user_id once and auto-load concerts
  useEffect(() => {
    const uid = localStorage.getItem("user_id") ?? localStorage.getItem("id") ?? "";
    if (uid) {
      setUserId(uid);
      onLoadConcerts(uid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const concertOptions = useMemo(
    () =>
      concerts.map((c) => {
        const id = normalizeId(c);
        const label = c.concert_name ?? c.ConcertName ?? `Concert #${id ?? ""}`;
        return { value: id, label };
      }),
    [concerts]
  );

  const showdateOptions = useMemo(
    () =>
      showdates.map((s) => {
        const id = normalizeId(s);
        const iso = s.show_date ?? s.ShowDate;
        return { value: id, label: fmtDate(iso) };
      }),
    [showdates]
  );

  const onLoadConcerts = async (uidOverride?: string) => {
    const uid = uidOverride ?? userId;
    if (!uid) {
      message.warning("No user_id in localStorage");
      return;
    }
    try {
      setLoading(true);
      const rows = await Seat.getconbyuser(uid);
      setConcerts(Array.isArray(rows) ? rows : []);
      // reset downstream
      setConcertId(undefined);
      setShowdates([]);
      setShowdateId(undefined);
      setZones([]);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Load concerts failed");
    } finally {
      setLoading(false);
    }
  };

  const onConcertChange = async (cidRaw: number | string | null) => {
    const cid = cidRaw ? Number(cidRaw) : undefined;
    setConcertId(cid);
    setShowdates([]);
    setShowdateId(undefined);
    setZones([]);
    if (!cid) return;
    try {
      setLoading(true);
      const rows = await Seat.getshowbycon(cid);
      setShowdates(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Load showdates failed");
    } finally {
      setLoading(false);
    }
  };

  const onShowdateChange = (sidRaw: number | string | null) => {
    const sid = sidRaw ? Number(sidRaw) : undefined;
    setShowdateId(sid);
    // no manual fetch here—useEffect below will react to both ids being set
  };

  // 🔁 Auto-fetch zones whenever BOTH concertId & showdateId are selected
  useEffect(() => {
    const fetchZones = async () => {
      if (!concertId || !showdateId) {
        setZones([]);
        return;
      }
      try {
        setLoading(true);
        const rows = await Seat.getzonebyshow(showdateId);
        setZones(Array.isArray(rows) ? rows : []);
      } catch (e: any) {
        console.error(e);
        message.error(e?.message || "Load zones failed");
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, [concertId, showdateId]);

  const columns = [
    { title: "ID", key: "ID", render: (_: any, r: ZoneInterface) => normalizeId(r), width: 90 },
    { title: "ShowDateID", dataIndex: "showdate_id", key: "showdate_id" },
    { title: "Zone Name", dataIndex: "zone_name", key: "zone_name" },
    {
      title: "Zone Type",
      key: "zone_type",
      render: (_: any, r: ZoneInterface) =>
        r.zone_type?.zone_type ??
        (r as any).ZoneType?.zone_type ??
        `#${(r as any).zonetype_id ?? "—"}`,
    },
    { title: "Zone Type ID", dataIndex: "zonetype_id", key: "zonetype_id" },
    {
      title: "Price",
      key: "zone_price",
      render: (_: any, r: ZoneInterface) =>
        (r as any).zone_price ?? (r as any).zonePrice ?? "—",
    },
    { title: "Capacity", dataIndex: "capacity", key: "capacity" },
    { title: "Sold", dataIndex: "seat_sold", key: "seat_sold" },
    { title: "Pending", dataIndex: "pending_hold", key: "pending_hold" },
    {
      title: "Venue",
      key: "venue",
      render: (_: any, r: ZoneInterface) =>
        (r as any).venue?.venue_name ??
        `#${(r as any).venue_id ?? normalizeId((r as any).venue) ?? "—"}`,
    },
  ];

  return (
    <SidebarLayout>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
          <Col>
            <Space wrap>
              <Button onClick={() => onLoadConcerts()} loading={loading}>
                Reload concerts (current user)
              </Button>

              <Select
                style={{ minWidth: 240 }}
                placeholder="Select concert (by user)"
                options={concertOptions}
                value={concertId ?? null}
                onChange={onConcertChange}
                disabled={!userId || loading}
                allowClear
              />

              <Select
                style={{ minWidth: 220 }}
                placeholder="Select showdate"
                options={showdateOptions}
                value={showdateId ?? null}
                onChange={onShowdateChange}
                disabled={!concertId || loading}
                allowClear
              />
              {/* 👆 no Search button anymore */}
            </Space>
          </Col>
        </Row>

        <Table
          rowKey={(r) => String(normalizeId(r))}
          dataSource={zones}
          columns={columns as any}
          loading={loading}
          bordered
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </SidebarLayout>
  );
};

export default ZoneBrowser;
