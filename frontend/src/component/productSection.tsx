import React, { useMemo, useRef } from "react";
import { Row, Col, Card, Typography, Carousel } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import { useNavigate } from "react-router-dom";
import ArrowButton from "../component/arrowCarouse";

const { Title, Paragraph, Text } = Typography;

type Product = any;

type Props = {
  products: Product[];
};

const contentStyle: React.CSSProperties = {
  margin: "0 auto",
  padding: 20,
  height: 420,
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
};

const ProductSection: React.FC<Props> = ({ products }) => {
  const navigate = useNavigate();
  const sliderRef = useRef<CarouselRef>(null);

  const ProductPageSize = 4;
  const totalPages = Math.ceil((products?.length || 0) / ProductPageSize) || 1;
  const Productpages = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, i) =>
        products.slice(i * ProductPageSize, (i + 1) * ProductPageSize)
      ),
    [products, totalPages]
  );

  return (
    <div style={{ padding: "20px 40px", position: "relative" }}>
      <Title level={2} style={{ margin: "32px 0 12px", marginLeft: "10%" }}>
        🛍️ Product Best Sellers
      </Title>

      <div style={{ position: "relative" }}>
        <ArrowButton
          direction="left"
          onClick={() => sliderRef.current?.prev()}
        />
        <ArrowButton
          direction="right"
          onClick={() => sliderRef.current?.next()}
        />

        <Carousel ref={sliderRef} dots>
          {Productpages.map((page, pageIndex) => (
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
                      styles={{ body: { padding: 0 } }}
                    >
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
                            `http://localhost:8000${product?.variants?.[0]?.picture}` ||
                            "/no-image.png"
                          }
                          alt={product.product_name}
                          style={{
                            height: 270,
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>

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
  );
};

export default ProductSection;
