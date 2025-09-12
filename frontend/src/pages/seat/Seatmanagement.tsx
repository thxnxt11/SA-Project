// src/pages/zones/ZoneBrowser.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Row,
  Select,
  Space,
  Table,
  Modal,
  Button,
  message,
  Form,
} from "antd";
import SidebarLayout from "../../component/layout/SidebarLayout";
import type { ZoneInterface } from "../../interface/zone";
import { venueoption, zoneApi } from "../../services/https";
import { seatAPI } from "../../services/https";

import AddZoneForm from "../seat/add/seat"; // <— ปรับมาใช้ไฟล์ AddZoneForm นี้
import EditZoneForm from "./edit/seat";
import SeatGrid, { type SeatAvailable } from "./editseat/seat";

import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEventSeat } from "react-icons/md";

// normalize API ids
const normalizeId = (x: any) => x?.id ?? x?.ID;
console.log("idk : ", normalizeId);

// normalize seat status to a strict union
const norm = (x?: string) =>
  (x ?? "").trim().toLowerCase() === "available" ? "available" : "unavailable";

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

type ConcertPick = {
  id?: number;
  ID?: number;
  concert_name?: string;
  ConcertName?: string;
};
type ShowDatePick = {
  id?: number;
  ID?: number;
  show_date?: string;
  ShowDate?: string;
  // เผื่อ API ส่ง venue_id มาด้วย หรือซ้อนใน venue
  venue_id?: number;
  venue?: { id?: number; ID?: number; venue_id?: number };
  Venue?: { id?: number; ID?: number; venue_id?: number };
};
type Option = { value: number; label: string };

export default function ZoneBrowser() {
  const [, setUserId] = useState<string>("");
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

  // Seat modal state
  const [isSeatOpen, setIsSeatOpen] = useState(false);
  const [seatZoneId, setSeatZoneId] = useState<number | null>(null);
  const [seatRows, setSeatRows] = useState<SeatAvailable[]>([]);
  const [initialSeatRows, setInitialSeatRows] = useState<SeatAvailable[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [savingSeats, setSavingSeats] = useState(false);

  // map showdate_id -> venue_id (ใช้เป็นค่าเริ่มต้น/ล็อกใน Add Zone)
  const [showdateVenueMap, setShowdateVenueMap] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    const uStr = localStorage.getItem("user") ?? localStorage.getItem("User");
    const user = uStr ? JSON.parse(uStr) : null;
    const uid = user?.id;
    if (uid) {
      setUserId(uid);
      fetchConcerts(uid);
    }
  }, []);

  const concertOptions = useMemo(
    () =>
      concerts.map((c) => {
        const id = normalizeId(c);
        return {
          value: id,
          label: c.concert_name ?? c.ConcertName ?? `Concert #${id}`,
        };
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
      const rows = await zoneApi.getconbyuser(uid);
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
      const rows: ShowDatePick[] = await zoneApi.getshowbycon(cid);
      setShowdates(Array.isArray(rows) ? rows : []);

      // สร้าง mapping showdate_id -> venue_id
      const map: Record<number, number> = {};
      (rows || []).forEach((r: any) => {
        const id = normalizeId(r);
        const venueId =
          r?.venue_id ??
          r?.venueId ??
          r?.venue?.id ??
          r?.venue?.ID ??
          r?.venue?.venue_id ??
          r?.Venue?.id ??
          r?.Venue?.ID ??
          r?.Venue?.venue_id;
        if (id != null && venueId != null) map[Number(id)] = Number(venueId);
      });
      setShowdateVenueMap(map);
    } catch (e: any) {
      message.error(e?.message || "Load showdates failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async (sid: number) => {
    try {
      setLoading(true);
      const rows = await zoneApi.getzonebyshow(sid);
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

    const zt = await zoneApi.getzonetype();
    const zRows = zt;
    const ztOpts: Option[] = (zRows || []).map((z: any) => ({
      value: z.id,
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
      const defaultVenueId =
        showdateVenueMap[Number(showdateId!)] ?? values.venue_id;

      // กันพลาด: บังคับ venue_id ให้ตาม showdate ถ้ามี map
      const created = await zoneApi.add({
        ...values,
        showdate_id: showdateId,
        venue_id: defaultVenueId,
      });

      const newZoneId = created?.id ?? created?.ID;

      message.success("Zone created");
      setIsAddOpen(false);

      // seed seats เฉพาะ zone type = 2 (seat)
      if (newZoneId && Number(values.zonetype_id) === 2) {
        try {
          await seatAPI.addbyid(newZoneId);
        } catch (e) {
          console.warn("Seeding seats failed:", e);
        }
      }

      if (showdateId) await fetchZones(showdateId);
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

      const payload: any = {
        showdate_id: Number(showdateId),
        venue_id: Number(values.venue_id),
        zonetype_id: Number(values.zonetype_id),
        zone_name: String(values.zone_name).trim(),
      };
      if (values.zone_price != null)
        payload.zone_price = Number(values.zone_price);
      if (values.capacity != null) payload.capacity = Number(values.capacity);
      if (values.seat_sold != null)
        payload.seat_sold = Number(values.seat_sold);
      if (values.pending_hold != null)
        payload.pending_hold = Number(values.pending_hold);

      await zoneApi.update(id, payload);
      message.success("Zone updated");
      setIsEditOpen(false);
      setEditingZone(null);
      await fetchZones(Number(showdateId));
    } catch (e: any) {
      if (!e?.errorFields) message.error(e?.message || "Update failed");
    }
  };

  const getZoneTypeName = (r: any): string | undefined => {
    const nameFromRow = r?.zone_type?.zone_type ?? r?.ZoneType?.zone_type;
    if (nameFromRow) return String(nameFromRow);
    const id =
      r?.zonetype_id ??
      r?.zone_type_id ??
      r?.zoneTypeId ??
      r?.zone_type?.id ??
      r?.ZoneType?.id;
    if (id == null) return undefined;
    const opt = (zoneTypeOptions || []).find(
      (o) => Number(o.value) === Number(id)
    );
    return opt?.label;
  };

  const handleDelete = (zoneId: number) =>
    Modal.confirm({
      title: "Delete zone?",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          try {
            await seatAPI.deletebyid(zoneId);
          } catch {}
          await zoneApi.delete(zoneId);
          message.success("Zone deleted");
          if (showdateId) fetchZones(showdateId);
        } catch (e: any) {
          message.error(e?.message || "Delete failed");
        }
      },
    });

  const nf = new Intl.NumberFormat();

  // -------- Seat modal helpers --------
  const loadSeats = async (zoneId: number) => {
    try {
      setLoadingSeats(true);
      const rows = await seatAPI.getbyzoneid(zoneId);
      const list: SeatAvailable[] = (Array.isArray(rows) ? rows : []).map(
        (s) => ({
          ...s,
          seatavailable_status: norm(s.seatavailable_status),
        })
      );
      setSeatRows(list);
      // snapshot for diff
      setInitialSeatRows(list.map((s) => ({ ...s })));
    } catch (e: any) {
      message.error(e?.message || "Load seats failed");
    } finally {
      setLoadingSeats(false);
    }
  };

  const toggleSeat = (seat: SeatAvailable) => {
    setSeatRows((prev) =>
      prev.map((s) =>
        s.seat_id === seat.seat_id
          ? {
              ...s,
              seatavailable_status:
                norm(s.seatavailable_status) === "available"
                  ? "unavailable"
                  : "available",
            }
          : s
      )
    );
  };

  const buildFullZonePayload = (z: any, capacityOverride?: number) => {
    const venueId = z?.venue_id ?? z?.venueId ?? z?.venue?.id;
    const zoneTypeId =
      z?.zonetype_id ??
      z?.zone_type_id ??
      z?.zoneTypeId ??
      z?.zone_type?.id ??
      z?.ZoneType?.id;
    const zonePrice = z?.zone_price ?? z?.zonePrice;

    return {
      showdate_id: Number(z?.showdate_id ?? showdateId),
      venue_id: Number(venueId ?? 0),
      zonetype_id: Number(zoneTypeId ?? 0),
      zone_name: String(z?.zone_name ?? "").trim(),
      zone_price: zonePrice != null ? Number(zonePrice) : 0,
      capacity:
        capacityOverride != null
          ? Number(capacityOverride)
          : Number(z?.capacity ?? 0),
      seat_sold: Number(z?.seat_sold ?? 0),
      pending_hold: Number(z?.pending_hold ?? 0),
    };
  };

  const handleApplySeats = async () => {
    if (!seatZoneId) return;
    try {
      setSavingSeats(true);

      const delta = seatRows.filter((s) => {
        const old = initialSeatRows.find((o) => o.seat_id === s.seat_id);
        return (
          old && norm(old.seatavailable_status) !== norm(s.seatavailable_status)
        );
      });

      if (delta.length) {
        await Promise.all(
          delta.map((s) =>
            seatAPI.updatebyid(seatZoneId, s.seat_id, {
              seatavailable_status: norm(s.seatavailable_status),
            })
          )
        );
      }

      const availableCount = seatRows.filter(
        (s) => norm(s.seatavailable_status) === "available"
      ).length;

      const source =
        zones.find((z) => Number(normalizeId(z)) === Number(seatZoneId)) ??
        editingZone;

      if (!source) {
        await zoneApi.update(seatZoneId, {
          showdate_id: Number(showdateId),
          zone_name: `Zone #${seatZoneId}`,
          venue_id: 0,
          zonetype_id: 0,
          zone_price: 0,
          seat_sold: 0,
          pending_holds: 0,
          capacity: availableCount,
        });
      } else {
        const fullPayload = buildFullZonePayload(source, availableCount);
        await zoneApi.update(seatZoneId, fullPayload);
      }

      message.success("Seats updated");
      setIsSeatOpen(false);
      if (showdateId) await fetchZones(showdateId);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Apply failed");
    } finally {
      setSavingSeats(false);
    }
  };

  const openSeat = async (zone: ZoneInterface) => {
    const id = Number(normalizeId(zone));
    if (!id) {
      message.error("Invalid zone");
      return;
    }
    setEditingZone(zone);
    setSeatZoneId(id);
    setIsSeatOpen(true);
    await loadSeats(id);
  };

  const columns = [
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
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      render: (v: any) => (v != null ? nf.format(v) : "—"),
    },
    {
      title: "Sold",
      dataIndex: "seat_sold",
      key: "seat_sold",
      render: (v: any) => (v != null ? nf.format(v) : 0),
    },
    {
      title: "Pending",
      dataIndex: "pending_hold",
      key: "pending_hold",
      render: (v: any) => (v != null ? nf.format(v) : 0),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      render: (_: any, r: ZoneInterface) => {
        const id = normalizeId(r);
        const ztName = getZoneTypeName(r)?.toLowerCase();
        const isStanding = ztName === "standing";

        return (
          <Space>
            <FaEdit
              style={{ fontSize: 20, color: "#0048ffff", cursor: "pointer" }}
              onClick={() => openEdit(r)}
            />
            <RiDeleteBin6Line
              style={{ fontSize: 20, color: "#ff0000ff", cursor: "pointer" }}
              onClick={() => handleDelete(Number(id))}
            />
            {!isStanding && (
              <MdEventSeat
                style={{ fontSize: 20, color: "#1abb78ff", cursor: "pointer" }}
                onClick={() => openSeat(r)}
              />
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <SidebarLayout>
      <h1>Seating Plan Management</h1>
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

      {/* Add Zone */}
      <Modal
        open={isAddOpen}
        onCancel={() => setIsAddOpen(false)}
        footer={null}
        destroyOnClose
      >
        <AddZoneForm
          showdateId={showdateId!}
          venueOptions={venueOptions}
          zoneTypeOptions={zoneTypeOptions}
          // set ค่า venue ให้ตาม showdate และล็อกไม่ให้แก้
          initialValues={{ venue_id: showdateVenueMap[Number(showdateId!)] }}
          fixedVenueId={showdateVenueMap[Number(showdateId!)]}
          onFinish={handleAddZone}
        />
      </Modal>

      {/* Edit Zone */}
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

      {/* Seat Manage */}
      <Modal
        open={isSeatOpen}
        title={`Manage seats — ${
          editingZone?.zone_name ?? (seatZoneId ? `Zone #${seatZoneId}` : "")
        }`}
        onCancel={() => setIsSeatOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setIsSeatOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={savingSeats}
              onClick={handleApplySeats}
            >
              Apply
            </Button>
          </Space>
        }
        destroyOnHidden
        width={920}
      >
        <SeatGrid
          seats={seatRows}
          loading={loadingSeats}
          onSeatClick={toggleSeat}
          onCancel={() => setIsSeatOpen(false)}
          onApply={handleApplySeats}
          columnsPerRow={15}
        />
      </Modal>
    </SidebarLayout>
  );
}
