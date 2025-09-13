import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, message } from "antd";
import SidebarLayout from "../../../component/layout/SidebarLayout";
import EditConcertForm from "./edit/consert";
import AddConcertForm from "./add/consert";
import type { ConcertInterface } from "../../../interface/concert";
import dayjs from "dayjs";

import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import { concertAPI, ShowDateAPI } from "../../../services/https";
import { useAuth } from "../../../hook/authContext";

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
  const [editingConcert, setEditingConcert] = useState<ConcertInterface | null>(
    null
  );
  const [addConcert, setaddConcert] = useState<ConcertInterface | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {user} = useAuth()
  const fetchConcerts = async () => {
    try {
      setLoading(true);
      const rows = await concertAPI.getAll(); // returns .data already
      const concertData = rows?.data;
      setConcerts(Array.isArray(concertData) ? concertData : []);
      console.log("concert: ", rows);
      console.log("setconcert: ", concerts);
    } catch (e: any) {
      console.error(e);
      message.error("cant load concerts list :(");
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

  const openAdd = () => {
    setaddConcert({} as ConcertInterface);
    setIsModalOpen(true);
    setEditingConcert(null);
  };

  const handleEditFinish = async (values: any) => {
    if (!editingConcert) return;

    const payload = {
      ...editingConcert,
      ...values,
      onsale_date: values.onsale_date
        ? dayjs(values.onsale_date)
            .tz("Asia/Bangkok")
            .format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ")
        : editingConcert.onsale_date,

      offsale_date: values.offsale_date
        ? dayjs(values.offsale_date)
            .tz("Asia/Bangkok")
            .format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ")
        : editingConcert.offsale_date,
    };
    console.log(payload);

    // ดึงวันแสดงเดิมและใหม่มาเปรียบเทียบ
    const oldDates =
      editingConcert?.ShowDates?.map((sd) =>
        dayjs(sd.show_date).format("YYYY-MM-DD")
      ) ?? [];
    const newDates = [
      values.date1,
      values.date2,
      values.date3,
      values.date4,
      values.date5,
      values.date6,
      values.date7,
    ]
      .filter(Boolean)
      .map((d) => dayjs(d).format("YYYY-MM-DD"));

    // หาวันที่ต้องลบ (มีใน old แต่ไม่มีใน new)
    const datesToDelete = oldDates.filter(
      (oldDate) => !newDates.includes(oldDate)
    );

    // หาวันที่ต้องเพิ่ม (มีใน new แต่ไม่มีใน old)
    const datesToAdd = newDates.filter(
      (newDate) => !oldDates.some((oldDate) => oldDate === newDate)
    );
    console.log("delet: ", datesToDelete);
    console.log("Add: ", datesToAdd);
    try {
      await concertAPI.update(editingConcert.ID, payload);

      // ลบเฉพาะวันที่ถูกลบออก
      for (const d of datesToDelete) {
        await ShowDateAPI.deleteByDate(editingConcert.ID, d); // ต้องมี API deleteByDate
      }

      // เพิ่มเฉพาะวันที่ใหม่
      for (const d of datesToAdd) {
        await ShowDateAPI.add({
          concert_id: Number(editingConcert.ID),
          venue_id: Number(values.venue_id),
          show_date: dayjs(d)
            .tz("Asia/Bangkok")
            .format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ"),
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
          await ShowDateAPI.delete(id);

          await concertAPI.delete(id);

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
    // const uStr = localStorage.getItem("user") ?? localStorage.getItem("User");

    const uid = user?.id;
    console.log("user_id =  ", uid);
    const user_id = uid ? Number(uid) : undefined;
    if (!user_id) {
      message.error("Missing user_id (please sign in again)");
      return;
    }

    if (
      values.show_end_time &&
      dayjs(values.show_end_time).isBefore(values.show_start_time)
    ) {
      message.error("End time must be after start time");
      return;
    }

    const concertPayload = {
      concert_name: values.concert_name,
      artist: values.artist,
      venue_id: Number(values.venue_id),
      onsale_date: values.onsale_date
        ? dayjs(values.offsale_date)
            .tz("Asia/Bangkok")
            .format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ")
        : undefined,
      offsale_date: values.offsale_date
        ? dayjs(values.offsale_date)
            .tz("Asia/Bangkok")
            .format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ")
        : undefined,
      concert_poster_url: values.concert_poster_url ?? "",
      user_id,
    } as const;

    try {
      const created = await concertAPI.create(concertPayload);
      const concertId = created?.ID ?? created?.id;
      if (!concertId) {
        message.error("Create concert succeeded but no ID returned");
        return;
      }

      if (values.date1) {
        let inx = [
          values.date1,
          values.date2,
          values.date3,
          values.date4,
          values.date5,
          values.date6,
          values.date7,
        ];
        for (let i = 0; i < inx.length; i++) {
          if (inx[i] != undefined) {
            await ShowDateAPI.add({
              concert_id: Number(concertId),
              venue_id: Number(values.venue_id),
              show_date: inx[i]
                ? dayjs(inx[i])
                    .tz("Asia/Bangkok")
                    .format("YYYY-MM-DDTHH:mm:ss.SSSSSSZ")
                : undefined,
            });
          }
          console.log("showdate  created ID :", i);
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
      title: "On Sale Ticket",
      dataIndex: "onsale_date",
      key: "onsale_date",
      render: (d?: string) => fmtDate(d),
    },
    {
      title: "Off Sale Ticket",
      dataIndex: "offsale_date",
      key: "offsale_date",
      render: (d?: string) => fmtDate(d),
    },
    {
      title: "Show Date",
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
          <a
            href={`${API}${r.concert_poster_url}`}
            target="_blank"
            rel="noreferrer"
          >
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
    // {
    //   title: "CraeteBy",
    //   dataIndex: "user_id",
    //   key: "user_id",
    // },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, r: ConcertInterface) => {
        const uidStr =
          localStorage.getItem("user_id") ?? localStorage.getItem("id");

        const currentUserId = uidStr ? Number(uidStr) : NaN;
        const ownerId = Number(r.user_id);
        const canEdit =
          Number.isFinite(currentUserId) && currentUserId === ownerId;

        if (!canEdit) return null;

        return (
          <Space direction="vertical">
            <FaEdit
              onClick={() => openEdit(r)}
              style={{
                fontSize: "18px",
                color: "#0048ffff",
                cursor: "pointer",
              }}
            >
              Edit
            </FaEdit>

            <RiDeleteBin6Line
              onClick={() => handleDelete(r.ID)}
              style={{
                fontSize: "18px",
                color: "#ff0000ff",
                cursor: "pointer",
              }}
            >
              Remove
            </RiDeleteBin6Line>
          </Space>
        );
      },
    },
  ];

  return (
    <SidebarLayout>
      <div style={{ display: "flex ", flexDirection: "row" }}>
        <h1>Concerts Management</h1>
        <Button
          className="payment-button"
          size="large"
          style={{
            position: "fixed",
            left: 1380,
          }}
          type="primary"
          onClick={openAdd}
        >
          + Add data
        </Button>
      </div>

      <div style={{ marginTop: 30, marginLeft: 20 }}>
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
          setaddConcert(null);
          setEditingConcert(null);
        }}
        footer={null}
      >
        {editingConcert && (
          <EditConcertForm
            initialValues={editingConcert}
            onFinish={handleEditFinish}
          />
        )}

        {addConcert && (
          <AddConcertForm
            initialValues={addConcert}
            onFinish={handleAddconcert}
          />
        )}
      </Modal>
    </SidebarLayout>
  );
}
