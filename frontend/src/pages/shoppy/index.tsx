import React, { useEffect, useState } from "react";
import { Typography,  Row, Col, Card, Spin, Carousel, Divider } from "antd";
import { useNavigate } from "react-router-dom";
import { productsAPI } from "./../../services/https";
import Navbar from "../../component/layout/navbar";

const { Paragraph, Text, Title } = Typography;

const contentStyle: React.CSSProperties = {
  margin: "0 auto",
  padding: 20,
  height: "420px",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#9faac0ff",
  borderRadius: 12,
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
  // เรียง New Arrivals ตามวันที่สร้าง (ใหม่ → เก่า)
  const sortedByDate = [...products].sort(
    (a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime()
  );

  const newArrivalPages = Array.from({ length: totalPages }, (_, i) =>
    sortedByDate.slice(i * pageSize, (i + 1) * pageSize)
  );

  // const pages = Array.from({ length: totalPages }, (_, i) =>
  //   products.slice(i * pageSize, (i + 1) * pageSize)
  // );

  const sortedBySales = [...products].sort(
    (a, b) => (b.sales || 0) - (a.sales || 0)
  );
  const bestSellerPages = Array.from({ length: totalPages }, (_, i) =>
    sortedBySales.slice(i * pageSize, (i + 1) * pageSize)
  );
  const renderCarousel = (pages: any[]) => (
    <Carousel arrows>
      {pages.map((page, pageIndex) => (
        <div key={pageIndex}>
          <Row gutter={[24, 32]} justify="center" style={contentStyle}>
            {page.map((product: any) => (
              <Col key={product.ID}>
                <Card
                  hoverable
                  onClick={() =>
                    navigate(`/shopping/productdetail/${product.ID}`)
                  }
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
                    body: { padding: 0 },
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
                      src={
                        product?.variants?.[0]?.picture
                          ? `http://localhost:8000${product?.variants?.[0]?.picture}`
                          : "/no-image.png"
                      }
                      alt={product.product_name}
                      style={{
                        height: 270,
                        width: "100%",
                        objectFit: "cover",
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
  );

  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "40px 80px",
          background: "#fff",
          minHeight: "100vh",
        }}
      >
        {/* New Arrivals */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Divider orientation="center"><Title level={2}>New Arrivals</Title></Divider>
        </div>
        <div style={{ margin: "0 auto", width: "1250px", height: "450px" }}>
          {renderCarousel(newArrivalPages)}
        </div>

        {/* Best Sellers */}
        <div style={{ textAlign: "center", margin: "60px 0 40px" }}>
          <Title level={2}>Best Sellers</Title>
        </div>
        <div style={{ margin: "0 auto", width: "1250px", height: "450px" }}>
          {renderCarousel(bestSellerPages)}
        </div>
      </div>
    </>
  );
};

export default ShoppingPage;