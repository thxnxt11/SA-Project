// src/pages/concert/concert.tsx
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, message } from "antd";
import SidebarLayout from "../../../component/layout/SidebarLayout";
import EditConcertForm from "./edit/consert";
import AddConcertForm from "./add/consert";
import type { ConcertInterface } from "../../../interface/concert";



import {
  getAllConcerts,
  updateConcert,
  deleteConcert,
  addConcerts as createConcert,
} from "../../../services/https/concert";


const API = "http://localhost:8000"; 

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

export default function ConcertManagement() {
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [editingConcert, setEditingConcert] = useState<ConcertInterface | null>(null);
  const [addConcert, setaddConcert] = useState<ConcertInterface | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchConcerts = async () => {
    try {
      setLoading(true);
      const rows = await getAllConcerts();
      setConcerts(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      console.error(e);
      message.error("โหลดรายชื่อคอนเสิร์ตไม่สำเร็จ");
      setConcerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  const openEdit = (record: ConcertInterface) => {
    setEditingConcert(record);
    setIsModalOpen(true);
    setaddConcert(null);   
  };

  const openAdd = () =>{
    setaddConcert({} as ConcertInterface);
    setIsModalOpen(true)
    setEditingConcert(null);   
  }

  const handleEditFinish = async (values: any) => {
    if (!editingConcert) return;

    const payload = {
      ...editingConcert, // keep fields not in the form
      ...values,
      onsale_date: values.onsale_date
      ? values.onsale_date.toDate().toISOString()  
      : editingConcert.onsale_date,
      offsale_date: values.offsale_date
      ? values.offsale_date.toDate().toISOString()
      : editingConcert.offsale_date,
    };

    try {
      await updateConcert(editingConcert.ID, payload);
      message.success("อัปเดตคอนเสิร์ตสำเร็จ");
      setIsModalOpen(false);
      setEditingConcert(null);
      fetchConcerts();
    } catch (e: any) {
      console.error("Update failed:", e);
      message.error(e?.message || "อัปเดตไม่สำเร็จ");
    }
  };

  const handleDelete = (id: number) =>
    Modal.confirm({
      title: "Are you sure that you gonna delete this concert data",
      content: "after press this button cant be roll back",
      okText: "delete",
      okType: "danger",
      cancelText: "cancel",
      onOk: async () => {
        try {
          await deleteConcert(id);
          message.success("delete suscessful");
          fetchConcerts();
        } catch (e: any) {
          console.error(e);
          message.error(e?.message || "delete unsuscessful");
        }
      },
    });

  const handleAddconcert = async (values: any) => {
    
    
    const payload = {
      concert_name: values.concert_name,
      artist: values.artist,
      venue_id : Number(values.venue_id),
      onsale_date: values.onsale_date ? values.onsale_date.toDate().toISOString() : null,
      offsale_date: values.offsale_date ? values.offsale_date.toDate().toISOString() : null,
      concert_poster_url: values.concert_poster_url ?? "",
    };

    try {
      await createConcert(payload);
      message.success("add complete?]!");
      setIsModalOpen(false);
      setaddConcert(null);
      fetchConcerts();
    } catch (e: any) {
      console.error("Update failed:", e);
      message.error(e?.message || "Update failed");
    }
  };


  const columns = [
    // { title: "ID", dataIndex: "ID", key: "ID" },
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
      render: (_: any, r: ConcertInterface) => (r as any)?.venue?.venue_name ?? "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, r: ConcertInterface) => (
        <Space direction="vertical">
          <Button size="small" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Button danger size="small" onClick={() => handleDelete(r.ID)}>
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <SidebarLayout>

      <Button
        size="large"
        style={{ color: "white", backgroundColor: "#00306E", position: "relative", left: 1110, margin: 20 }}
        onClick={openAdd}
      >
        Add data
      </Button>
      <Table
        dataSource={concerts}
        columns={columns as any}
        rowKey="ID"
        bordered
        loading={loading}
        pagination={{ pageSize: 50 }}
      />

      <Modal
        title="Edit Concert"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setaddConcert(null)
          setEditingConcert(null);
        }}
        footer={null}
      >
        {editingConcert && (
        <EditConcertForm initialValues={editingConcert} onFinish={handleEditFinish} />
        )}

        {addConcert && (
        <AddConcertForm initialValues={addConcert} onFinish={handleAddconcert} />
        )}

      </Modal>

      

    </SidebarLayout>
  );
}
