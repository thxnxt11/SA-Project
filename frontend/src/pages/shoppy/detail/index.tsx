import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Divider,
  message,
  InputNumber,
} from "antd";

import onceshirt from "../../../assets/onceshirt.jpg";

const { Title, Text } = Typography;

const mockProduct = {
  id: 1,
  name: "ONCE T-Shirt",
  description: "เสื้อยืดสุดพิเศษสำหรับแฟนคลับ Eventix ผลิตจาก cotton 100%",
  price: 1399,
  image: onceshirt,
  availableSizes: ["S", "M", "L", "XL", "XXL"],
  availableColors: ["Red", "Black", "White"],
};

const ProductDetailPage: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState<number>(1); // ✅ เพิ่ม state สำหรับจำนวน

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      message.warning("กรุณาเลือกสีและขนาดก่อนเพิ่มลงตะกร้า");
      return;
    }

    message.success(
      `เพิ่ม ${mockProduct.name} [${selectedColor}/${selectedSize}] จำนวน ${quantity} ชิ้น ลงตะกร้าแล้ว!`
    );
  };

  return (
    <Card style={{ maxWidth: 1000, margin: "40px auto", padding: 24 }}>
      <Row gutter={[32, 32]}>
        {/* รูปสินค้า */}
        <Col xs={24} md={10}>
          <Card
            style={{
              width: "100%",
              height: 350,
              background: "#f1f3f4",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign: "center",
              padding: 0,
              overflow: "hidden",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div
              style={{
                width: "100%",
                height: "100%", // ✅ ให้ container สูงเต็ม Card
                overflow: "hidden",
              }}
            >
              <img
                src={onceshirt}
                alt="onceshirt"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // ✅ ทำให้รูปเต็มโดยไม่บิดเบี้ยว
                  display: "block",
                }}
              />
            </div>
          </Card>
        </Col>

        {/* รายละเอียดสินค้า */}
        <Col xs={24} md={14} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* ส่วนบน: ชื่อ รายละเอียด */}
          <div style={{ flexGrow: 1 }}>
            <Title level={3}>{mockProduct.name}</Title>
            <Text type="secondary">{mockProduct.description}</Text>
          </div>

          {/* ส่วนล่าง: ปุ่มต่าง ๆ ชิดด้านล่าง */}
          <div>
            {/* เลือกสี */}
            <div style={{ marginTop: 120 }}>
            <Divider />
              <Text strong>Select Color:</Text>
              {/* <Space wrap style={{ marginTop: 8 }}> */}
                {mockProduct.availableColors.map((color) => (
                  <Button
                    key={color}
                    type={selectedColor === color ? "primary" : "default"}
                    onClick={() => setSelectedColor(color)}
                    style={{ marginLeft: 8 }}
                  >
                    {color}
                  </Button>
                ))}
              {/* </Space> */}
            </div>

            {/* เลือกขนาด */}
            <div style={{ marginTop: 16 }}>
              <Text strong>Select Size:</Text>
              {/* <Space wrap style={{ marginTop: 8 }}> */}
                {mockProduct.availableSizes.map((size) => (
                  <Button
                    key={size}
                    type={selectedSize === size ? "primary" : "default"}
                    onClick={() => setSelectedSize(size)}
                    style={{ marginLeft: 8 }}
                  >
                    {size}
                  </Button>
                ))}
              {/* </Space> */}
                </div>

            {/* จำนวน */}
            <div style={{ marginTop: 16 }}>
              <Text strong>Quantity:</Text>
                <InputNumber
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(value) => setQuantity(value || 1)}
                  style={{ marginLeft: 8 }}
                />
            </div>

            <Divider style={{ marginTop: 16 , marginBottom: 16}} />
            <Title level={4}>THB {mockProduct.price.toLocaleString()}</Title>
            <Button
              type="primary"
              size="large"
              style={{ marginTop: 6, width: "30%", backgroundColor: "#FF2F28"}}
              onClick={handleAddToCart}
              
            >
              Add to Cart
            </Button>
          </div>
        </Col>

      </Row>
    </Card>
  );
};

export default ProductDetailPage;
