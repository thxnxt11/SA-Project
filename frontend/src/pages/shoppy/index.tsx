import React from "react";
import {  Typography, Row, Col, Card, Divider  } from "antd";
import {  useNavigate } from "react-router-dom"; //  เพิ่ม
import onceshirt from "../../assets/onceshirt.jpg"
const { Title, Text } = Typography;
const mockProducts = [
  { id: 1, name: "Merchandise detail", price: "THB 1,xxx" },
  { id: 2, name: "Merchandise detail", price: "THB 1,xxx" },
  { id: 3, name: "Merchandise detail", price: "THB 1,xxx" },
  { id: 4, name: "Merchandise detail", price: "THB 1,xxx" },
  { id: 5, name: "Merchandise detail", price: "THB 1,xxx" },
  { id: 6, name: "Merchandise detail", price: "THB 1,xxx" },
];
const ShoppingPage: React.FC = () => {
  const navigate = useNavigate(); 
  return (
      <div style={{ padding: "40px 80px", background: "#fff", minHeight: "100vh" }}>
      {/* หัวข้อ */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Title level={2}>New Arrivals</Title>
      </div>

      {/* รายการสินค้า */}
      <Row gutter={[24, 32]} justify="center">
        {mockProducts.map((product) => (
          <Col key={product.id} xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              onClick={() => navigate("/shoppy/detail")}
              style={{
                width: "100%",
                height: 300,
                background: "#f1f3f4",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textAlign: "center",
                padding: 0, // เอา padding ออกให้ layout แน่น
                overflow: "hidden", // ✅ ป้องกันภาพล้น
                
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* รูปสินค้า (ขยายความสูงขึ้น) */}
              <div
                style={{
                  flexGrow: 1,
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 220, // ✅ ปรับให้สูงขึ้น
                  overflow: "hidden", // ✅ ป้องกันภาพล้น
                }}
              >
                {/* จะใส่ <img src="..." /> ก็ได้ */}
                <img src={onceshirt} alt="onceshirt" />
              </div>

              {/* เนื้อหา */}
              <Row
                style={{
                  background: "#f1f3f4",
                  padding: "8px",
                  marginBottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <Text>{product.name}</Text>
                <Text strong style={{ marginTop: 4 }}>{product.price}</Text> {/* ✅ ราคาอยู่ล่างสุดของกล่องนี้ */}
              </Row>
            </Card>
            <Divider style={{ marginTop: 48 , marginBottom: 16}} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ShoppingPage;
