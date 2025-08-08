import React, { useState } from "react";
import {
  Card,
  Typography,
  Table,
  Radio,
  Button,
  Divider,
  Row,
  Col,
  message,
} from "antd";

const { Title } = Typography;

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const mockCart: CartItem[] = [
  { id: 1, name: "ONCE T-Shirt", price: 1399, quantity: 1 },
  { id: 2, name: "Light Stick", price: 1600, quantity: 2 },
];

const PaymentOrderPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState("credit");

  const total = mockCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = 100; // ลดราคาแบบ fix
  const netTotal = total - discount;

  const handlePayment = () => {
    message.success(`ชำระเงินผ่าน "${paymentMethod}" เรียบร้อยแล้ว!`);
  };

  const columns = [
    {
      title: "สินค้า",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "จำนวน",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "ราคารวม",
      key: "total",
      render: (_: any, record: CartItem) =>
        `THB ${(record.price * record.quantity).toLocaleString()}`,
    },
  ];

  return (
    <Card style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <Title level={3}>ชำระเงิน</Title>

      {/* รายการสินค้า */}
      <Table
        columns={columns}
        dataSource={mockCart}
        rowKey="id"
        pagination={false}
        bordered
        style={{ marginBottom: 24 }}
      />

      {/* สรุปยอดชำระ */}
      <Row justify="end" gutter={[16, 16]}>
        <Col span={12}>
          <Card>
            <Row justify="space-between">
              <Col>ราคารวม</Col>
              <Col>THB {total.toLocaleString()}</Col>
            </Row>
            <Row justify="space-between" style={{ marginTop: 8 }}>
              <Col>ส่วนลด</Col>
              <Col>- THB {discount.toLocaleString()}</Col>
            </Row>
            <Divider />
            <Row justify="space-between" style={{ fontWeight: "bold" }}>
              <Col>ยอดสุทธิ</Col>
              <Col>THB {netTotal.toLocaleString()}</Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* ช่องทางการชำระเงิน */}
      <Title level={4}>เลือกช่องทางการชำระเงิน</Title>
      <Radio.Group
        onChange={(e) => setPaymentMethod(e.target.value)}
        value={paymentMethod}
        style={{ marginBottom: 16 }}
      >
        <Radio value="credit">บัตรเครดิต / เดบิต</Radio>
        <Radio value="bank">โอนผ่านธนาคาร</Radio>
        <Radio value="wallet">วอลเล็ต (เช่น TrueMoney, ShopeePay)</Radio>
        <Radio value="cod">เก็บเงินปลายทาง</Radio>
      </Radio.Group>

      <br />

      {/* ปุ่มยืนยัน */}
      <Button type="primary" size="large" onClick={handlePayment}>
        ยืนยันการชำระเงิน
      </Button>
    </Card>
  );
};

export default PaymentOrderPage;
