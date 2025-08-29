// src/pages/zones/ZoneBrowser.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Select, Space, Table, Modal, Button, message } from "antd";
import axios from "axios";

import { Seat } from "../../services/https/seat";
import { venueoption } from "../../services/https/concert";
import type { ZoneInterface } from "../../interface/zone";
import SidebarLayout from "../../component/layout/SidebarLayout";

// ⬇️ you'll need this form file from earlier (or your own)
import AddZoneForm from "./add/seat";

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
type Option = { value: number; label: string };

const API_ORG = "http://localhost:8000/organizer";

const ZoneBrowser: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [concerts, setConcerts] = useState<ConcertPick[]>([]);
  const [concertId, setConcertId] = useState<number | undefined>();

  const [showdates, setShowdates] = useState<ShowDatePick[]>([]);
  const [showdateId, setShowdateId] = useState<number | undefined>();

  const [zones, setZones] = useState<ZoneInterface[]>([]);
  const [loading, setLoading] = useState(false);

  // add modal state + picklists
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [zoneTypeOptions, setZoneTypeOptions] = useState<Option[]>([]);
  const [venueOptions, setVenueOptions] = useState<Option[]>([]);

  // read user_id once and auto-load concerts
  useEffect(() => {
    const uid = localStorage.getItem("user_id") ?? localStorage.getItem("id") ?? "";
    if (uid) {
      setUserId(uid);
      onLoadConcerts(uid);
    }
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
    if (!uid) return;

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

  // single place to fetch zones (GET by showdate id)
  const fetchZones = async (sid?: number, cid?: number) => {
    const finalSid = sid ?? showdateId;
    const finalCid = cid ?? concertId;
    if (!finalSid || !finalCid) {
      setZones([]);
      return;
    }
    try {
      setLoading(true);
      const rows = await Seat.getzonebyshow(finalSid);
      setZones(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Load zones failed");
    } finally {
      setLoading(false);
    }
  };

  const onShowdateChange = (sidRaw: number | string | null) => {
    const sid = sidRaw ? Number(sidRaw) : undefined;
    setShowdateId(sid);
    if (sid && concertId) fetchZones(sid, concertId);
  };

  useEffect(() => {
    fetchZones();
  }, [concertId, showdateId]);

  // --- Actions ---
  const onEditZone = (zone: ZoneInterface) => {
    console.log("edit zone clicked:", zone);
  };

  const handleDeleteZone = (zoneId: number) =>
    Modal.confirm({
      title: "Are you sure you want to delete this zone?",
      content: "After deleting, this action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Seat.delete should point to DELETE /organizer/zone/:id
          await Seat.delete(zoneId);
          message.success("Delete successful");
          await fetchZones();
        } catch (e: any) {
          console.error(e);
          message.error(e?.message || "Delete unsuccessful");
        }
      },
    });


  const openAdd = async () => {
    if (!showdateId) {
      message.warning("Select a showdate first");
      return;
    }
    try {
      setLoading(true);

      const zt = await axios.get(`${API_ORG}/zonetype`);
      const ztOpts: Option[] = Array.isArray(zt.data)
        ? zt.data.map((z: any) => ({ value: z.id ?? z.ID, label: z.zone_type }))
        : [];
      setZoneTypeOptions(ztOpts);


      const venues = await venueoption();
      const vOpts: Option[] = Array.isArray(venues)
        ? venues.map((v: any) => ({
            value: v.value ?? v.id ?? v.ID ?? Number(v.venue_id),
            label: v.label ?? v.venue_name,
          }))
        : [];
      setVenueOptions(vOpts);

      setIsAddOpen(true);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Load picklists failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 create zone (seat_sold / pending_hold = 0, showdate_id from selection)
  const handleAddZone = async (values: any) => {
    if (!showdateId) {
      message.error("Missing showdate_id (select showdate first)");
      return;
    }

    const payload = {
      showdate_id: Number(showdateId),
      venue_id: Number(values.venue_id),
      zonetype_id: Number(values.zonetype_id),
      zone_name: values.zone_name,
      zone_price: values.zone_price != null ? Number(values.zone_price) : undefined,
      capacity: values.capacity != null ? Number(values.capacity) : undefined,
      seat_sold: 0,
      pending_hold: 0,
    } as const;

    try {
      // Seat.add must call POST /organizer/zone with these fields
      const created = await Seat.add(payload);
      const newId = created?.ID ?? created?.id;
      if (!newId) {
        message.warning("Zone created but no ID returned");
      } else {
        message.success("Zone created");
      }
      setIsAddOpen(false);
      await fetchZones();
    } catch (e: any) {
      console.error("Create failed:", e);
      message.error(e?.message || "Create failed");
    }
  };

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
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      render: (_: any, r: ZoneInterface) => {
        const id = normalizeId(r);
        return (
          <Space>
            <Button size="small" onClick={() => onEditZone(r)}>
              Edit
            </Button>
            <Button danger size="small" onClick={() => id && handleDeleteZone(Number(id))}>
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <SidebarLayout>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 12 }}>
          <Col>
            <Space wrap>
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
            </Space>
          </Col>

          {/* ➕ Add button (top-right) */}
          <Col>
            <Button type="primary" onClick={openAdd} disabled={!showdateId} loading={loading}>
              Add
            </Button>
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

      {/* Add Zone Modal */}
      <Modal
        title="Add Zone"
        open={isAddOpen}
        onCancel={() => setIsAddOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <AddZoneForm
          showdateId={Number(showdateId)}
          zoneTypeOptions={zoneTypeOptions}
          venueOptions={venueOptions}
          onFinish={handleAddZone}
        />
      </Modal>
    </SidebarLayout>
  );
};

export default ZoneBrowser;
