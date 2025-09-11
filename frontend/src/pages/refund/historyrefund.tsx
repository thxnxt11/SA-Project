import { useEffect, useState } from "react";
import { Button, Card, message, Popconfirm, Select, Table, Tag } from "antd";
import type { TableProps } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { useAuth } from "../../hook/authContext";
import Navbar from "../../component/layout/navbar";
import { refundAPI } from "../../services/https";
import type { Refund } from "../../interface/refund";

export const RefundHis: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Refund[]>([]);

  useEffect(() => {
    if (user?.id) {
      refundAPI
        .getHistory(Number(user.id))
        .then((response) => {
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
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const statusOptions = [
    { value: 1, label: "รอดำเนินการ" },
    { value: 2, label: "ดำเนินการเสร็จสิ้น" },
    { value: 3, label: "ปฏิเสธคำขอ" },
  ];

  const handleUpdateStatus = async (
    refund_id: number,
    refund_status_id: number,
    requester_id: number
  ) => {
    try {
      const res = await refundAPI.updateStatus(
        refund_id,
        refund_status_id,
        requester_id
      );
      console.log("Update status response:", res);
      message.success("อัปเดตสถานะสำเร็จ");

      // อัปเดต state frontend ด้วย
      setData((prev) =>
        prev.map((item) =>
          item.id === refund_id ? { ...item, refund_status_id } : item
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      message.error("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await refundAPI.delete(id);
      message.success("ลบข้อมูลสำเร็จ");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
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
      key: "status",
      render: (_, record) => {
        if (user?.role_id === 3) {
          return (
            <Select
              value={record.status}
              style={{ width: 180 }}
              onChange={(val) =>
                handleUpdateStatus(
                  record.id,
                  Number(val),
                  Number(user.id)
                )
              }
              options={statusOptions.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
          );
        }
        let color = "blue";
        switch (record.status) {
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
        return <Tag color={color}>{record.status || "-"}</Tag>;
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
          onConfirm={() => handleDelete(record.id)}
          okText="ใช่"
          cancelText="ไม่"
        >
          <Button danger disabled={user?.role_id !== 2}>
            Delete
          </Button>
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
