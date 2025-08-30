// src/pages/concert/concert.tsx
import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, message } from "antd";
import SidebarLayout from "../../../component/layout/SidebarLayout";
import EditConcertForm from "./edit/consert";
import AddConcertForm from "./add/consert";
import type { ConcertInterface } from "../../../interface/concert";
import dayjs from "dayjs"



import {
  Concerts,
  Showdate,
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
    const rows = await Concerts.getAll();   // returns .data already
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
    ...editingConcert,
    ...values,
    onsale_date: values.onsale_date
      ? values.onsale_date.toDate().toISOString()
      : editingConcert.onsale_date,
    offsale_date: values.offsale_date
      ? values.offsale_date.toDate().toISOString()
      : editingConcert.offsale_date,
  };

  const newDates = [
    values.date1, values.date2, values.date3,
    values.date4, values.date5, values.date6, values.date7,
  ].filter(Boolean);

  try {
    await Concerts.update(editingConcert.ID, payload);
    await Showdate.delete(editingConcert.ID);

    for (const d of newDates) {
      await Showdate.add({
        concert_id: Number(editingConcert.ID),
        venue_id: Number(values.venue_id),
        show_date: d.toDate().toISOString(),
      });
    }

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
 
        await Showdate.delete(id);


        await Concerts.delete(id);

        message.success("delete successful");
        fetchConcerts();
      } catch (e: any) {
        console.error(e);
        message.error(e?.message || "delete unsuccessful");
      }
    },
  });



  const handleAddconcert = async (values: any) => {
  // user_id
  const uidStr = localStorage.getItem("user_id") ?? localStorage.getItem("id");
  const user_id = uidStr ? Number(uidStr) : undefined;
  if (!user_id) {
    message.error("Missing user_id (please sign in again)");
    return;
  }


  if (values.show_end_time && dayjs(values.show_end_time).isBefore(values.show_start_time)) {
    message.error("End time must be after start time");
    return;
  }

  
  const concertPayload = {
    concert_name: values.concert_name,
    artist: values.artist,
    venue_id: Number(values.venue_id),
    onsale_date: values.onsale_date ? dayjs(values.onsale_date).toISOString() : undefined,
    offsale_date: values.offsale_date ? dayjs(values.offsale_date).toISOString() : undefined,
    concert_poster_url: values.concert_poster_url ?? "",
    user_id,
  } as const;

  try {
    const created = await Concerts.add(concertPayload);
    const concertId = created?.ID ?? created?.id;
    if (!concertId) {
      message.error("Create concert succeeded but no ID returned");
      return;
    }

    
    if (values.date1) {
      let inx = [values.date1,values.date2,values.date3,values.date4,values.date5,values.date6,values.date7];
      for (let i = 0 ; i < inx.length ; i++)
      {
        if(inx[i] != undefined)
        {
          await Showdate.add({
          concert_id: Number(concertId),
          venue_id: Number(values.venue_id),
          show_date: inx[i] ? dayjs(inx[i]).toISOString() : undefined,  
          });
        }
        console.log("showdate  created ID :",i);
      }

    }

    message.success("Concert & showdate created");
    setIsModalOpen(false);
    setaddConcert(null);
    fetchConcerts();
  } catch (e: any) {
    console.error("Create failed:", e);
    message.error(e?.message || "Create failed");
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
      title: "Show time",
      key: "show_time",
      render: (_: any, record: any) => {
        const items = record.show_dates ?? record.ShowDates ?? [];
        if (!Array.isArray(items) || items.length === 0) return "—";
          return items
            .map((sd: any) => {
              const start = sd.start_time ?? sd.show_date; // fallback if legacy
              const end = sd.end_time;
              if (!start) return null;
              return end ? `${fmtDate(start)} – ${fmtDate(end)}` : fmtDate(start);
            })
            .filter(Boolean)
            .join(", ");
        },
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
      title: "user_id(test)",
      dataIndex: "user_id",
      key :"user_id",

    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, r: ConcertInterface) => {
        const uidStr = localStorage.getItem("user_id") ?? localStorage.getItem("id");

 
        const currentUserId = uidStr ? Number(uidStr) : NaN;
        const ownerId = Number(r.user_id);
        const canEdit = Number.isFinite(currentUserId) && currentUserId === ownerId;

        if (!canEdit) return null; 

        return (
          <Space direction="vertical">
            <Button size="small" onClick={() => openEdit(r)}>Edit</Button>
            <Button danger size="small" onClick={() => handleDelete(r.ID)}>Remove</Button>
          </Space>
        );
      },
    },

  ];

  return (
    <SidebarLayout>

      <Button
        size="large"
        style={{ color: "white", backgroundColor: "#00306E", position: "fixed", left: 1380, margin: 20 }}
        onClick={openAdd} 
    
      >
        Add data
      </Button>
      <div style={{ marginTop: 80, marginLeft: 20 }}>
        <Table
          
          dataSource={concerts}
          columns={columns as any}
          rowKey="ID"
          bordered
          loading={loading}
          pagination={{ pageSize: 50 }}
        />
      </div>

      <Modal
        
        title="Edit Concert"
        open={isModalOpen} 
        destroyOnHidden
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
