import React, { useEffect, useState } from "react";
import { Table, Typography, Card, Row, Col, message } from "antd";
import axios from "axios";
const { Title } = Typography;

const columns = [
  { title: "ProductID", dataIndex: "product_id", key: "product_id" },
  { title: "Name", dataIndex: "product_name", key: "product_name" },
  { title: "Amounts", dataIndex: "amount", key: "amount" },
  { title: "Updated", dataIndex: "updated", key: "updated" },
  { title: "Total", dataIndex: "total", key: "total" },
  { title: "Staff", dataIndex: "staff_name", key: "staff_name" },
  {
    title: "Created At",
    dataIndex: "created_at",
    key: "created_at",
    render: (text: string) => new Date(text).toLocaleString("th-TH"),
  },
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
      const res = await axios.get("http://localhost:8000/stockmovements"); // ปรับ URL ตาม backend ของคุณ
      if (res.status === 200) {
        setData(res.data);
        console.log(res.data);
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
          <Col span={6}>
            <Card style={{ background: "#DFE6EF", height: 150, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ textAlign: "left" }}>
                <Title level={5} style={{ margin: 5, fontSize: 16 }}>All products</Title>
              </div>
              <div style={{ textAlign: "center" }}>
                <Title style={{ margin: 0, fontSize: 40 }}>199657</Title>
              </div>
              <div style={{ textAlign: "right" }}>
                <Title level={5} style={{ margin: 0, fontSize: 16 }}>In the warehouse</Title>
              </div>
            </Card>
          </Col>

          <Col span={6}>
            <Card style={{ background: "#DFE6EF", height: 150, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ textAlign: "left" }}>
                <Title level={5} style={{ margin: 5, fontSize: 16 }}>This month's sales</Title>
              </div>
              <div style={{ textAlign: "center" }}>
                <Title style={{ margin: 0, fontSize: 40 }}>89147</Title>
              </div>
              <div style={{ textAlign: "right" }}>
                <Title level={5} style={{ margin: 0, fontSize: 16 }}>item</Title>
              </div>
            </Card>
          </Col>

          <Col span={6}>
            <Card style={{ background: "#DFE6EF", height: 150, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ textAlign: "left" }}>
                <Title level={5} style={{ margin: 5, fontSize: 16 }}>All added</Title>
              </div>
              <div style={{ textAlign: "center" }}>
                <Title style={{ margin: 0, fontSize: 40 }}>12450</Title>
              </div>
              <div style={{ textAlign: "right" }}>
                <Title level={5} style={{ margin: 0, fontSize: 16 }}>item</Title>
              </div>
            </Card>
          </Col>

          <Col span={6}>
            <Card style={{ background: "#DFE6EF", height: 150, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ textAlign: "left" }}>
                <Title level={5} style={{ margin: 5, fontSize: 16 }}>Notification</Title>
              </div>
              <div style={{ textAlign: "center" }}>
                <Title style={{ margin: 0, fontSize: 40 }}>69</Title>
              </div>
              <div style={{ textAlign: "right" }}>
                <Title level={5} style={{ margin: 0, fontSize: 16 }}>message</Title>
              </div>
            </Card>
          </Col>
        </Row>

        <Title style={{ marginTop: 24, fontSize: 16 }}>Latest update</Title>
        <Table
          columns={columns}
          dataSource={data}
          bordered
          pagination={{ pageSize: 5 }}
          rowKey="product_id"
          style={{ marginTop: 24 }}
        />
      </Card>
    </>
  );
};

export default DashboardWarehouse;