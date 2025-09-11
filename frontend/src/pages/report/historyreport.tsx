import { useEffect, useState } from "react";
import { Card, Table, Tag, Button, Modal, Input, message } from "antd";
import type { TableProps } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { useAuth } from "../../hook/authContext";
import Navbar from "../../component/layout/navbar";
import type { Report } from "../../interface/report";
import { reportAPI } from "../../services/https";

const { TextArea } = Input;

export const ReportHis = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal สำหรับตอบกลับ
  const [modalVisible, setModalVisible] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // โหลดประวัติรายงาน
  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await reportAPI.getHistory(Number(user.id));
      if (Array.isArray(response)) {
        const mapped = response.map((r: any) => ({
          id: r.ID,
          topic: r.topic,
          type: r.report_type?.type_name,
          status: r.report_status?.status_name,
          date: r.created_at || r.CreatedAt || r.createdAt,
          firstname: r.user?.first_name,
          lastname: r.user?.last_name,
          created_at: r.created_at,
          updated_at: r.updated_at,
        }));
        setData(mapped);
      } else {
        console.error("API response is not an array:", response);
      }
    } catch (err) {
      console.error("Error fetching report history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // ฟังก์ชันเปิด Modal
  const handleReply = (reportId: number | undefined) => {
    if (!reportId) {
      message.error("ไม่สามารถตอบกลับรายงานนี้ได้");
      return;
    }
    setCurrentReportId(reportId);
    setReplyMessage("");
    setModalVisible(true);
  };

  // ฟังก์ชันส่งข้อความตอบกลับ
  const submitReply = async () => {
    if (!replyMessage.trim()) {
      message.warning("กรุณากรอกข้อความตอบกลับ");
      return;
    }
    if (!currentReportId) {
      message.error("ไม่พบ ID รายงาน");
      return;
    }

    setLoading(true);
    try {
      await reportAPI.replyReport(
        currentReportId,
        replyMessage,
        Number(user?.id),
        Number(user?.role_id)
      );
      message.success("ตอบกลับเรียบร้อย");
      setModalVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการตอบกลับ");
    } finally {
      setLoading(false);
    }
  };

  // คอลัมน์ Table
  const columns: TableProps<Report>["columns"] = [
    {
      title: "Name",
      key: "name",
      render: (_, r) => `${r.firstname || ""} ${r.lastname || ""}`.trim(),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string | undefined) => {
        const color =
          status === "ตอบกลับแล้ว"
            ? "green"
            : status === "รอการตอบกลับ"
            ? "orange"
            : "blue";
        return <Tag color={color}>{status || "-"}</Tag>;
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (d: string | undefined) =>
        d ? dayjs(d).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Action",
      key: "action",
      render: (_, r) =>
        user?.role_id === 3 ? (
          <Button
            type="primary"
            onClick={() => handleReply(r.id)}
            disabled={r.status === "ตอบกลับแล้ว"}
          >
            ตอบกลับ
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <Navbar />
      <Card style={{ width: 1300, margin: "20px auto" }}>
        <Title level={2}>History</Title>
        <Table<Report>
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title="ตอบกลับรายงาน"
        open={modalVisible}
        onOk={submitReply}
        onCancel={() => {
          setModalVisible(false);
          setReplyMessage("");
        }}
        okText="ส่งข้อความ"
        confirmLoading={loading}
      >
        <TextArea
          rows={4}
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="พิมพ์ข้อความตอบกลับที่นี่..."
        />
      </Modal>
    </>
  );
};
