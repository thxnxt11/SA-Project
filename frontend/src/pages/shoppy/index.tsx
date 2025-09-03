import React from "react";
import {  Typography, Row, Col, Card, Divider  } from "antd";
import {  useNavigate } from "react-router-dom"; //  เพิ่ม
import onceshirt from "../../assets/onceshirt.jpg"
const { Title, Text } = Typography;
const mockProducts = [
  { id: 1, name: "Merchandise detail", price: "1,990" , product_picture: "data:image/jpeg;base64,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"},
  { id: 2, name: "Merchandise detail", price: "1,500" , product_picture: "https://m.media-amazon.com/images/I/51CpwuwSXjL.jpg"},
  { id: 3, name: "aespa Official SYNK PARALLEL LINE World Tour Merch Collection Dateback T-Shirt", price: "1,400" , product_picture: "https://m.media-amazon.com/images/I/719F9OzhWZL._AC_SX569_.jpg"},
  { id: 4, name: "Saja Boys Heartthrob Officially Licensed T-Shirt", price: "1,390" , product_picture: "https://m.media-amazon.com/images/I/B1pppR4gVKL._CLa%7C2140%2C2000%7CB1LreszsvuL.png%7C0%2C0%2C2140%2C2000%2B0.0%2C0.0%2C2140.0%2C2000.0_AC_SX466_.png"},
  { id: 5, name: "HUNTR/X Heartthrob Officially Licensed T-Shirt", price: "2,690" , product_picture: "https://m.media-amazon.com/images/I/B1pppR4gVKL._CLa%7C2140%2C2000%7CA15fChs1PML.png%7C0%2C0%2C2140%2C2000%2B0.0%2C0.0%2C2140.0%2C2000.0_AC_SX466_.png"},
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
          <Col key={product.id} >
            <Card
              hoverable
              onClick={() => navigate("/shoppy/detail")}
              style={{
                width: "270px",
                height: "380px",
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
              {/* รูปสินค้า  */}
              <div
                style={{
                  flexGrow: 1,
                  background: "#ffffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden", // ✅ ป้องกันภาพล้น
                }}
              >
                {/* จะใส่ <img src="..." /> ก็ได้ */}
                <img 
                  src={product.product_picture} 
                  alt="product_picture"
                  style={{
                    minHeight: "270px", 
                    width:"270px",
                  }}
                />
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
              <Row style={{overflow: "hidden",height:"55px"}}>
                <Title level={4}
                  style={{
                    // display: "flex",
                    // justifyContent: "space-between",          
                    // fontSize: 18
                    marginTop: 0
                  }}
                  ellipsis={{rows:2}}
                  >{product.name}
                </Title>
              </Row>
              <Row >
                <Text strong style={{ margin: 4, color: "#2167ff", fontSize: 20 }}>
                  ฿ {product.price} 
                </Text>
              </Row>
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