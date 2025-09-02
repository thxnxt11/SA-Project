import React, { useState } from "react";
import {
  Table,
  Button,
  Typography,
  InputNumber,
  Popconfirm,
  Row,
  Col,
  message,
  Card,
  Checkbox,
  Divider,
  Input,
  Space,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "../../../interface/cartitem";

const { Title } = Typography;

const initialCart: CartItem[] = [
  { id: 1, name: "Saja Boys Heartthrob Officially Licensed T-Shirt", color: "Red", size: "M", price: 1390 , quantity: 1 , picture: "https://m.media-amazon.com/images/I/B1pppR4gVKL._CLa%7C2140%2C2000%7CB1LreszsvuL.png%7C0%2C0%2C2140%2C2000%2B0.0%2C0.0%2C2140.0%2C2000.0_AC_SX466_.png"},
  { id: 2, name: "HUNTR/X Heartthrob Officially Licensed T-Shirt", color: "White", size: "L", price: 2690 , quantity: 1 , picture: "https://m.media-amazon.com/images/I/B1pppR4gVKL._CLa%7C2140%2C2000%7CA15fChs1PML.png%7C0%2C0%2C2140%2C2000%2B0.0%2C0.0%2C2140.0%2C2000.0_AC_SX466_.png"},
];

const CartPages: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCart);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState<string>("");
  const [discountRate, setDiscountRate] = useState<number>(0);
  const discountCodes: { [key: string]: number } = {
    DISCOUNT10: 0.10, // ลด 10%
    ONCE5: 0.05,      // ลด 5%
  };
  
  const applyDiscount = () => {
    const rate = discountCodes[discountCode.toUpperCase()];
    if (rate) {
      setDiscountRate(rate);
      message.success(`ใช้รหัสส่วนลดแล้ว: ลด ${rate * 100}%`);
    } else {
      setDiscountRate(0);
      message.error("ไม่พบรหัสส่วนลดนี้");
    }
  };
  
  const updateQuantity = (id: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
  )
);
};

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
    message.success("ลบสินค้าสำเร็จ");
  };

  const removeAllItems = () => {
    setCartItems([]);
    setSelectedRowKeys([]);
    message.success("เคลียร์ตะกร้าเรียบร้อยแล้ว");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(cartItems.map((item) => item.id));
    } else {
      setSelectedRowKeys([]);
    }
  };
  

  const isAllSelected = selectedRowKeys.length === cartItems.length && cartItems.length > 0;

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const selectedItems = cartItems.filter((item) =>
    selectedRowKeys.includes(item.id)
  );

  const totalSelectedPrice = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

 const toggleSelect = (id: number) => {
  setSelectedRowKeys((prev) =>
    prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]
  );
};
  return (
    <div style={{ width:"60%", margin: "20px auto", padding: 12, minHeight:"80vh" }}>
      <Row gutter={80}>
        <Col span={15}>
          {/* ✅ Card บนสุด: เลือกทั้งหมด + เคลียร์ตะกร้า */}
          <Card style={{ marginBottom:12 ,padding:1}}>
            <Row justify="space-between" align="middle">
              <Col>
                <Checkbox
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  Select All
                </Checkbox>
              </Col>
              <Col  style={{margin  : 2 ,gap: 8}}>
                <Popconfirm
                  title="ต้องการล้างตะกร้าทั้งหมดใช่หรือไม่?"
                  onConfirm={removeAllItems}
                  okText="ใช่"
                  cancelText="ยกเลิก"
                >
                  <Button 
                  danger icon={<DeleteOutlined/>} >
                    Clear Cart
                  </Button>
                </Popconfirm>
              </Col>
            </Row>
          </Card>

          {/* Table รายการสินค้า */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cartItems.map((item) => (
            <Card key={item.id} style={{ marginBottom: 12 }}>
              <Row gutter={16} style={{ alignItems: "stretch" }}>
                {/* ✅ Checkbox เลือกรายการ */}
                <Col span={1}>
                  <Checkbox
                    checked={selectedRowKeys.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </Col>

                {/* ✅ กรอบรูปภาพ */}
                <Col span={5}>
                  <div
                    style={{
                      border: "1px solid #d9d9d9",
                      borderRadius: 8,
                      padding: 4,
                      width: "100%",
                      height: 160,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <img
                      src={item.picture}// เปลี่ยนเป็น item.image ได้
                      alt={item.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </Col>

                {/* ✅ รายละเอียดสินค้า */}
                <Col span={12}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontWeight: "bold", fontSize: 16 }}>{item.name}</div>
                    <div>{item.color} | {item.size}</div>
                    <div>THB {item.price.toLocaleString()}</div>
                  </div>
                </Col>

                {/* ✅ ชิดล่าง: จำนวน + ปุ่มลบ */}
                <Col span={6}>
                  <div style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "flex-end"
                  }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(value) => updateQuantity(item.id, value || 1)}
                      />
                      <Popconfirm
                        title="ลบสินค้านี้หรือไม่?"
                        onConfirm={() => removeItem(item.id)}
                      >
                        <Button danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
            ))}
          </div>
        </Col>

        {/* Sidebar สรุปยอด */}
        <Col span={7}>
          <Card style={{background:"#f9f9f9ff"}}>
            <Title level={3}>Order Summary</Title>
              <Divider />
            {/* รายการสินค้า */}
            {selectedItems.map((item) => {
              const itemTotal = item.price * item.quantity;
              const discounted = itemTotal * (1 - discountRate);
              return (
                <div key={item.id}>
                  <div>
                    {item.name} x {item.quantity}
                  </div>
                  <div style={{ fontSize: 12, color: "gray" }}>
                    ราคาปกติ: THB {itemTotal.toLocaleString()}
                    {discountRate > 0 && (
                      <>
                        <br />
                        ราคาหลังหักส่วนลด:{" "}
                        <strong>THB {discounted.toLocaleString()}</strong>
                      </>
                    )}
                  </div>
                  <Divider />
                </div>
              );
            })}

            {/* ช่องใส่รหัสส่วนลด */}
            <Title level={3}>Discount Code</Title>
          
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="ใส่รหัสส่วนลด"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                style={{ marginBottom: 8 ,width:"80%"}}
                />
              <Button onClick={applyDiscount} block type="primary" style={{width:"20%"}}>
                Use
              </Button>
            </Space.Compact>

            {/* ราคารวม */}
            <Divider />
            <Title level={5}>
              ราคารวมหลังหักส่วนลด:
              <br />
              <span style={{ color: "#d4380d" }}>
                THB{" "}
                {selectedItems
                  .reduce(
                    (total, item) =>
                      total + item.price * item.quantity * (1 - discountRate),
                    0
                  )
                  .toLocaleString()}
              </span>
            </Title>

            <Button
              type="primary"
              disabled={selectedItems.length === 0}
              onClick={() => {
                console.log("Going to payment with:", selectedItems);
                navigate("/shoppy/payment", {
                  state: {
                    selectedItems,
                    discountRate,
                    discountCode,
                  },
                });
              }}
              block
            >
              ยืนยันการสั่งซื้อ ({selectedItems.length} รายการ)
            </Button>
          </Card>

        </Col>
      </Row>
    </div>
  );
};

export default CartPages;