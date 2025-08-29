// src/pages/zones/ZoneBrowser.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Select, Space, Table, Modal, Button, message, Form } from "antd";
import SidebarLayout from "../../component/layout/SidebarLayout";
import type { ZoneInterface } from "../../interface/zone";
import { Seat, Get } from "../../services/https/seat";
import { venueoption } from "../../services/https/concert";

import AddZoneForm from "./add/seat";
import EditZoneForm from "./edit/seat";

const API_ORG = "http://localhost:8000/organizer";

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

export default function ZoneBrowser() {
  const [userId, setUserId] = useState<string>("");
  const [concerts, setConcerts] = useState<ConcertPick[]>([]);
  const [concertId, setConcertId] = useState<number>();
  const [showdates, setShowdates] = useState<ShowDatePick[]>([]);
  const [showdateId, setShowdateId] = useState<number>();
  const [zones, setZones] = useState<ZoneInterface[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneInterface | null>(null);

  const [zoneTypeOptions, setZoneTypeOptions] = useState<Option[]>([]);
  const [venueOptions, setVenueOptions] = useState<Option[]>([]);
  const [editForm] = Form.useForm();

  useEffect(() => {
    const uid = localStorage.getItem("user_id") ?? localStorage.getItem("id") ?? "";
    if (uid) {
      setUserId(uid);
      fetchConcerts(uid);
    }
  }, []);

  const concertOptions = useMemo(
    () =>
      concerts.map((c) => {
        const id = normalizeId(c);
        return { value: id, label: c.concert_name ?? c.ConcertName ?? `Concert #${id}` };
      }),
    [concerts]
  );

  const showdateOptions = useMemo(
    () =>
      showdates.map((s) => {
        const id = normalizeId(s);
        return { value: id, label: fmtDate(s.show_date ?? s.ShowDate) };
      }),
    [showdates]
  );

  const fetchConcerts = async (uid: string) => {
    try {
      setLoading(true);
      const rows = await Seat.getconbyuser(uid);
      setConcerts(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      message.error(e?.message || "Load concerts failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchShowdates = async (cid: number) => {
    try {
      setLoading(true);
      const rows = await Seat.getshowbycon(cid);
      setShowdates(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      message.error(e?.message || "Load showdates failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async (sid: number) => {
    try {
      setLoading(true);
      const rows = await Seat.getzonebyshow(sid);
      setZones(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      message.error(e?.message || "Load zones failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchPicklists = async () => {
    const venues = await venueoption();
    const vOpts: Option[] = (venues || []).map((v: any) => ({
      value: v.value ?? v.id ?? v.ID ?? Number(v.venue_id),
      label: v.label ?? v.venue_name,
    }));
    setVenueOptions(vOpts);

    const zt = await Get(`${API_ORG}/zonetype`);
    const zRows = zt?.data || [];
    const ztOpts: Option[] = (zRows || []).map((z: any) => ({
      value: z.id ?? z.ID,
      label: z.zone_type,
    }));
    setZoneTypeOptions(ztOpts);
  };

  const openAdd = async () => {
    if (!showdateId) {
      message.warning("Select a showdate first");
      return;
    }
    await fetchPicklists();
    setIsAddOpen(true);
  };

  const handleAddZone = async (values: any) => {
    try {
      await Seat.add(values);
      message.success("Zone created");
      setIsAddOpen(false);
      if (showdateId) fetchZones(showdateId);
    } catch (e: any) {
      message.error(e?.message || "Create failed");
    }
  };

  const openEdit = async (zone: ZoneInterface) => {
    await fetchPicklists();
    setEditingZone(zone);
    editForm.setFieldsValue({
      
      venue_id: (zone as any).venue_id ?? (zone as any).venue?.id,
      zonetype_id: (zone as any).zonetype_id,
      zone_name: (zone as any).zone_name,
      zone_price: (zone as any).zone_price ?? (zone as any).zonePrice,
      capacity: (zone as any).capacity,
    });
    setIsEditOpen(true);
  };

const handleSaveEdit = async () => {
  try {
    if (!showdateId) {
      message.error("Select a showdate first");
      return;
    }

    const values = await editForm.validateFields();
    const id = editingZone ? Number(normalizeId(editingZone)) : undefined;
    if (!id) return;

    const payload = {
      showdate_id: Number(showdateId),                  
      venue_id: Number(values.venue_id),
      zonetype_id: Number(values.zonetype_id),
      zone_name: String(values.zone_name).trim(),     
      zone_price: values.zone_price != null ? Number(values.zone_price) : undefined,
      capacity: values.capacity != null ? Number(values.capacity) : undefined,
      ...(values.seat_sold != null ? { seat_sold: Number(values.seat_sold) } : {}),
      ...(values.pending_hold != null ? { pending_hold: Number(values.pending_hold) } : {}),
    };

    await Seat.update(id, payload);
    message.success("Zone updated");
    setIsEditOpen(false);
    setEditingZone(null);
    await fetchZones(Number(showdateId));
  } catch (e: any) {
    if (!e?.errorFields) message.error(e?.message || "Update failed");
  }
};

  const handleDelete = (zoneId: number) =>
    Modal.confirm({
      title: "Delete zone?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await Seat.delete(zoneId);
          message.success("Zone deleted");
          if (showdateId) fetchZones(showdateId);
        } catch (e: any) {
          message.error(e?.message || "Delete failed");
        }
      },
    });

  const nf = new Intl.NumberFormat(); // simple number fmt

  const columns = [
    { title: "ID", key: "ID", render: (_: any, r: ZoneInterface) => normalizeId(r), width: 90 },
    { title: "ShowDateID", dataIndex: "showdate_id", key: "showdate_id", width: 110 },
    { title: "Zone Name", dataIndex: "zone_name", key: "zone_name" },
    {
      title: "Venue",
      key: "venue",
      render: (_: any, r: ZoneInterface) =>
        (r as any).venue?.venue_name ??
        `#${(r as any).venue_id ?? (r as any).venue?.id ?? "—"}`,
    },
    {
      title: "Zone Type",
      key: "zone_type",
      render: (_: any, r: ZoneInterface) =>
        (r as any).zone_type?.zone_type ??
        (r as any).ZoneType?.zone_type ??
        `#${(r as any).zonetype_id ?? "—"}`,
    },
    {
      title: "Zone Price",
      key: "zone_price",
      render: (_: any, r: ZoneInterface) => {
        const p = (r as any).zone_price ?? (r as any).zonePrice;
        return p != null ? nf.format(Number(p)) : "—";
      },
    },
    { title: "Capacity", dataIndex: "capacity", key: "capacity", render: (v: any) => (v != null ? nf.format(v) : "—") },
    { title: "Sold", dataIndex: "seat_sold", key: "seat_sold", render: (v: any) => (v != null ? nf.format(v) : 0) },
    { title: "Pending", dataIndex: "pending_hold", key: "pending_hold", render: (v: any) => (v != null ? nf.format(v) : 0) },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      render: (_: any, r: ZoneInterface) => {
        const id = normalizeId(r);
        return (
          <Space>
            <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
            <Button danger size="small" onClick={() => handleDelete(Number(id))}>Delete</Button>
          </Space>
        );
      },
    },
  ];

  return (
    <SidebarLayout>
      <Card>
        <Row justify="space-between" style={{ marginBottom: 12 }}>
          <Col>
            <Space>
              <Select
                style={{ minWidth: 240 }}
                placeholder="Select concert"
                options={concertOptions}
                value={concertId}
                onChange={(cid) => {
                  setConcertId(Number(cid));
                  setShowdateId(undefined);
                  setZones([]);
                  fetchShowdates(Number(cid));
                }}
              />
              <Select
                style={{ minWidth: 220 }}
                placeholder="Select showdate"
                options={showdateOptions}
                value={showdateId}
                onChange={(sid) => {
                  setShowdateId(Number(sid));
                  fetchZones(Number(sid));
                }}
                disabled={!concertId}
              />
            </Space>
          </Col>
          <Col>
            <Button type="primary" onClick={openAdd} disabled={!showdateId}>
              Add Zone
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

      <Modal open={isAddOpen} onCancel={() => setIsAddOpen(false)} footer={null} destroyOnClose>
        <AddZoneForm
          showdateId={showdateId!}
          venueOptions={venueOptions}
          zoneTypeOptions={zoneTypeOptions}
          onFinish={handleAddZone}
        />
      </Modal>

      <Modal
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setEditingZone(null);
        }}
        onOk={handleSaveEdit}
        okText="Save"
        destroyOnHidden
      >
        <EditZoneForm
          form={editForm}
          venueOptions={venueOptions}
          zoneTypeOptions={zoneTypeOptions}
          initialValues={editingZone ?? undefined}
        />
      </Modal>
    </SidebarLayout>
  );
}
