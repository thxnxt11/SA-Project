import { useEffect, useState } from "react";
import { Card, Table, Tag } from "antd";
import type { TableProps } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { useAuth } from "../../hook/authContext";
import Navbar from "../../component/layout/navbar";
import type { Report } from "../../interface/report";
import { getReportHistory } from "../../services/https";

export const ReportHis = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Report[]>([]);

  useEffect(() => {
    if (user?.id) {
      getReportHistory(Number(user.id))
        .then((response) => {
          console.log("API Response:", response); // <-- เช็คข้อมูลที่ได้
          if (Array.isArray(response)) {
            const mapped = response.map((r: any) => ({
              id: r.id,
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
        })
        .catch((err) => console.error("Error fetching report history:", err));
    }
  }, [user]);

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
        let color = "blue"; // ค่า default
        switch (status) {
          case "ตอบกลับแล้ว":
            color = "green";
            break;
          case "รอการตอบกลับ":
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
        />
      </Card>
    </>
  );
};
