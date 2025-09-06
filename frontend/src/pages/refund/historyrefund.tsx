import { useEffect, useState } from "react";
import { Button, Card, message, Popconfirm, Table, Tag } from "antd";
import type { TableProps } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { useAuth } from "../../hook/authContext";
import Navbar from "../../component/layout/navbar";
import { getRefundHistory } from "../../services/https";
import type { Refund } from "../../interface/refund";
import { deleteRefund } from "../../services/https";

export const RefundHis = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Refund[]>([]);

  useEffect(() => {
    if (user?.id) {
      getRefundHistory(Number(user.id))
        .then((response) => {
          console.log("API Response:", response); // <-- เช็คข้อมูลที่ได้
          if (Array.isArray(response)) {
            const map = response.map((re: any) => ({
              id: re.id,
              bookingid: re.bookingid,
              status: re.refund_status?.status_name,
              booking_code: re.booking?.booking_code,
              amount: re.amount,
              date: re.created_at || re.CreatedAt || re.createdAt,
              firstname: re.user?.first_name,
              lastname: re.user?.last_name,
              created_at: re.created_at,
              updated_at: re.updated_at,
            }));
            setData(map);
          } else {
            console.error("API response is not an array:", response);
          }
        })
        .catch((err) => console.error("Error fetching refund history:", err));
    }
  }, [user]);

  const handleDelete = async (id: number) => {
    try {
      await deleteRefund(id); // id = record.id
      message.success("ลบข้อมูลสำเร็จ");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting refund:", err);
      message.error("ไม่สามารถลบข้อมูลได้");
    }
  };  

  const columns: TableProps<Refund>["columns"] = [
    {
      title: "BookingCode",
      dataIndex: "booking_code",
      key: "booking_code",
    },
    {
      title: "Name",
      key: "name",
      render: (_, re) => `${re.firstname || ""} ${re.lastname || ""}`.trim(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string | undefined) => {
        let color = "blue"; // ค่า default
        switch (status) {
          case "ดำเนินการเสร็จสิ้น":
            color = "green";
            break;
          case "ปฏิเสธคำขอ":
            color = "red";
            break;
          case "รอดำเนินการ":
            color = "orange";
            break;
        }
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
      render: (_, record) => (
        <Popconfirm
          title="ยืนยันการลบ?"
          onConfirm={() => handleDelete(record.id)} // <-- ตรงนี้ต้องเป็น record.id
          okText="ใช่"
          cancelText="ไม่"
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <Card style={{ width: 1300, margin: "20px auto" }}>
        <Title level={2}>History</Title>
        <Table<Refund> columns={columns} dataSource={data} rowKey="id" />
      </Card>
    </>
  );
};
