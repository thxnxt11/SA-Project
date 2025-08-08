import React from "react";
import { Table, Typography, Card, Row, Col } from "antd";

const { Title } = Typography;

const columns = [
  {
    title: "ProductID",
    dataIndex: "product_id",
    key: "product_id",
  },
  {
    title: "Name",
    dataIndex: "product_name",
    key: "product_name",
  },
  {
    title: "จำนวนที่เพิ่ม/ลด",
    dataIndex: "amount",
    key: "amount",
  },
  {
    title: "สถานะ",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "คงคลัง",
    dataIndex: "total",
    key: "total",
  },
  {
    title: "หมายเหตุ",
    dataIndex: "notation",
    key: "notation",
  },
];

const data = [
  {
    product_id: "1",
    product_name: "Eventix shirt",
    amount: "100",
    total: "1500",
    status: "เพิ่ม",
    notation: "-",

  },
  {
    product_id: "2",
    product_name: "jetts2holiday",
    amount: "60",
    total: "1500",
    status: "ลด",
    notation: "-",
  },
  {
    product_id: "3",
    product_name: "COMPUTER",
    amount: "20",
    total: "1500",
    status: "เพิ่ม",
    notation: "-",
  },
];

const Notification: React.FC = () => {
  return (
    <Card style={{ background: "#fff", padding: 10 }}>
      <Title style={{ padding : 0 ,  marginTop: 0, marginBottom : 0, fontSize: 32}}>DashBoard</Title>
      <Title style={{ padding : 10 , marginTop: 0, fontSize: 16 }}  >ภาพรวมคลังสินค้า</Title>

      <Row gutter={[50, 40]} >
        <Col span={6}>
          <Card style={{ background: "#BFD8F8", height: 150 }}>
            <Title style={{ margin: 0, fontSize: 16 }}>จำนวนทั้งหมด</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={{ background: "#BFD8F8", height: 150 }}>
            <Title style={{ margin: 0, fontSize: 16 }}>ยอดขายเดือนนี้</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={{ background: "#BFD8F8", height: 150 }}>
            <Title style={{ margin: 0, fontSize: 16 }}>ที่เพิ่มทั้งหมด</Title>
          </Card>
        </Col>

        <Col span={6}>
          <Card style={{ background: "#BFD8F8", height: 150 }}>
            <Title style={{ margin: 0, fontSize: 16 }}>แจ้งเตือนสินค้าใกล้หมด</Title>
          </Card>
        </Col>
      </Row>
      <Title style={{ marginTop: 24, fontSize: 16 }}>การอัปเดตล่าสุด</Title>
      
      <Table
        columns={columns}
        dataSource={data}
        bordered
        pagination={{ pageSize: 5 }}
        className="centered-table"
        style={{ marginTop: 24 }}
      />
    </Card>
  );
};

export default Notification;
