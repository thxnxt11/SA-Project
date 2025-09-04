import React, { useEffect, useState } from "react";
import { Table, Typography, Card, Row, Col, message } from "antd";
import axios from "axios";
const { Title } = Typography;

const columns = [
  // { title: "ProductID", dataIndex: "product_id", key: "product_id" },
  { title: "Name", dataIndex: "product_name", key: "product_name" },
  { title: "Variant", dataIndex: "variant_name", key: "variant_name" }, // เพิ่ม variant
  { title: "Action", dataIndex: "updated", key: "updated" },
  { title: "Amounts", dataIndex: "amount", key: "amount" },
  { title: "Total", dataIndex: "total", key: "total" },
  { title: "Staff", dataIndex: "staff_name", key: "staff_name" },
  {
    title: "Updated At",
    dataIndex: "updated_at",
    key: "updated_at",
    render: (text: string) => new Date(text).toLocaleString("th-TH"),
  },
];

const DashboardWarehouse: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchStockMovements = async () => {
    try {
      const res = await axios.get("http://localhost:8000/stockmovements");
      if (res.status === 200) {

        console.log(res.data);
        setData(res.data);
      } else {
        messageApi.error("ไม่สามารถโหลดข้อมูล stock movement ได้");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  useEffect(() => {
    fetchStockMovements();
  }, []);

  return (
    <>
      {contextHolder}
      <Card style={{ background: "#fff", padding: 10 }}>
        <Title style={{ fontSize: 32 }}>DashBoard</Title>
        <Title style={{ fontSize: 16 }}>Warehouse Overview</Title>

        <Row gutter={[50, 40]} style={{ padding: 10 }}>
          {/* ... ข้อมูล summary card เหมือนเดิม ... */}
        </Row>

        <Title style={{ marginTop: 24, fontSize: 16 }}>Latest update</Title>
        <Table
          columns={columns}
          dataSource={data}
          bordered
          pagination={{ pageSize: 5 }}
          rowKey={(record) => record.variant_id} // ใช้ variant_id เป็น key
          style={{ marginTop: 24 }}
        />
      </Card>
    </>
  );
};

export default DashboardWarehouse;