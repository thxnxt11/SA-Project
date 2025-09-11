import React, { useEffect, useState } from "react";
import { Typography,  Row, Col, Card, Spin, Carousel } from "antd";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "./../../services/https";
import Navbar from "../../component/layout/navbar";

const { Paragraph, Text, Title } = Typography;

const contentStyle: React.CSSProperties = {
  margin: "0 auto",
  padding:20,
  height: '420px',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#6194f3ff',
};

const ShoppingPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsAPI.getAllProducts();
        setProducts(res.data); 
        console.log(res.data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const pageSize = 4;
  const totalPages = 4; 
  const pages = Array.from({ length: totalPages }, (_, i) =>
    products.slice(i * pageSize, (i + 1) * pageSize)
  );

  return (
    <>
      <Navbar/>

      <div style={{ padding: "40px 80px", background: "#fff", minHeight: "100vh" }}>
        {/* หัวข้อ */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Title level={2}>New Arrivals</Title>
        </div>
        <div style={{ margin: "0 auto", width:"1250px",height:"450px"}}>
          <Carousel  
            // style={{ margin: "0 auto" }}
            arrows
            >
            {pages.map((page, pageIndex) => (
              <div key={pageIndex}>
                <Row gutter={[24, 32]} justify="center" style={contentStyle}>
                  {page.map((product) => (
                    <Col key={product.ID}>
                      <Card
                        hoverable
                        onClick={() => navigate(`/shopping/productdetail/${product.ID}`)}
                        style={{
                          width: 270,
                          height: 380,
                          background: "#f1f3f4",
                          overflow: "hidden",   
                          display: "flex",
                          flexDirection: "column",
                          textAlign: "center",
                        }}
                        styles={{
                          body: {
                            padding: 0, 
                          },
                        }}
                        >
                        {/* รูปสินค้า */}
                        <div
                          style={{
                            flexGrow: 1,
                            background: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                          >
                          <img
                            src={`http://localhost:8000${product?.variants?.[0]?.picture}` || "/no-image.png"}
                            alt={product.product_name}
                            style={{
                              height: 270,
                              width: "100%",
                              objectFit: "cover",
                              // overflow: "hidden",
                            }}
                            />
                        </div>

                        {/* เนื้อหา */}
                        <div style={{ background: "#f1f3f4", padding: 8 }}>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{ fontSize: 16, marginBottom: 8, height: 44 }}
                            >
                            {product.product_name}
                          </Paragraph>
                          <Text strong style={{ color: "#2167ff", fontSize: 20 }}>
                            ฿ {product.product_price?.toLocaleString()}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </>
  );
};

export default ShoppingPage;