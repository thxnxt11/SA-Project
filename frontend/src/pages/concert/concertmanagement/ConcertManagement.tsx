// src/pages/concert/concert.tsx
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, message } from "antd";
import SidebarLayout from "../../../component/layout/SidebarLayout";
import EditConcertForm from "./edit/consert";
import type { ConcertInterface } from "../../../interface/concert";

const API = "http://localhost:8000";

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  // treat Go's zero-time as empty
  if (iso.startsWith("0001-")) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
};

export default function ConcertManagement() {
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [editingConcert, setEditingConcert] = useState<ConcertInterface | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchConcerts = async () => {
    try {
      const res = await fetch(`${API}/organizer/concerts`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConcerts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      message.error("โหลดรายชื่อคอนเสิร์ตไม่สำเร็จ");
      setConcerts([]);
    }
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  const openEdit = (record: ConcertInterface) => {
    setEditingConcert(record);
    setIsModalOpen(true);
  };



const handleEditFinish = async (values: any) => {
  if (!editingConcert) return;

  const payload = {
    // merge with original so we don't wipe fields not in the form
    ...editingConcert,
    ...values,
    // ensure dates are strings, not moment objects
    onsale_date: values.onsale_date
      ? values.onsale_date.format("YYYY-MM-DD")
      : editingConcert.onsale_date,
    offsale_date: values.offsale_date
      ? values.offsale_date.format("YYYY-MM-DD")
      : editingConcert.offsale_date,
  };

  try {
    const res = await fetch(`${API}/organizer/concerts/${editingConcert.ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setIsModalOpen(false);
    setEditingConcert(null);
    fetchConcerts();
  } catch (e) {
    console.error("Update failed:", e);
  }
}

  const handleDelete = (id: number) =>
    Modal.confirm({
      title: "คุณแน่ใจหรือไม่ว่าจะลบคอนเสิร์ตนี้?",
      content: "การลบข้อมูลนี้จะไม่สามารถกู้คืนได้",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          await fetch(`${API}/organizer/concerts/${id}`, { method: "DELETE" });
          fetchConcerts();
        } catch (e) {
          console.error(e);
          message.error("ลบไม่สำเร็จ");
        }
      },
    });

  const columns = [
    { title: "ID", dataIndex: "ID", key: "ID" },
    { title: "Concert Name", dataIndex: "concert_name", key: "concert_name" },
    { title: "Artist", dataIndex: "artist", key: "artist" },
    {
      title: "On sale",
      dataIndex: "onsale_date",
      key: "onsale_date",
      render: (d?: string) => fmtDate(d),
    },
    {
      title: "Off sale",
      dataIndex: "offsale_date",
      key: "offsale_date",
      render: (d?: string) => fmtDate(d),
    },
    {
      title: "Poster",
      key: "concert_poster_url",
      render: (_: any, r: ConcertInterface) =>
        r.concert_poster_url ? (
          <a href={`${API}${r.concert_poster_url}`} target="_blank" rel="noreferrer">
            เปิดรูป
          </a>
        ) : (
          "—"
        ),
    },
    {
      title: "Venue",
      key: "venue",
      render: (_: any, r: ConcertInterface) =>
        (r as any)?.venue?.venue_name ?? "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, r: ConcertInterface) => (
        <Space direction="vertical">
          <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
          <Button danger size="small" onClick={() => handleDelete(r.ID)}>Remove</Button>
        </Space>
      ),
    },
  ];

  return (
    <SidebarLayout>
      <Button
        size="large"
        style={{ color: "white", backgroundColor: "#00306E", position: "absolute", right: 10 }}
      >
        Add data
      </Button>

      <Table
        dataSource={concerts}
        columns={columns as any}
        rowKey="ID"
        bordered
        pagination={{ pageSize: 50 }}
      />

      <Modal
        title="Edit Concert"
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingConcert(null); }}
        footer={null}
      >
        {editingConcert && (
          <EditConcertForm initialValues={editingConcert} onFinish={handleEditFinish} />
        )}
      </Modal>
    </SidebarLayout>
  );
}
