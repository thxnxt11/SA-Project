import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Divider,
  message,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";
import type { ProductInterface } from "../../../interface/product";
import type { ColorInterface } from "../../../interface/color";
import type { SizeInterface } from "../../../interface/size";

const { Title, Text } = Typography;


const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductInterface | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorInterface | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ โหลดข้อมูลสินค้า
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get<ProductInterface>(
          `http://localhost:8000/products/${id}`
        );
        console.log(res.data);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        message.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
      } finally {
        setLoading(false);
      }
    };

if (id) {
  fetchProduct();
}
}, [id]);

  const availableColors: ColorInterface[] =
    product?.variants
      ?.map(v => v.color)
      .filter((c): c is ColorInterface => !!c) || [];

  const availableSizes: SizeInterface[] =
    product?.variants
      ?.map(v => v.size)
      .filter((s): s is SizeInterface => !!s) || [];


  // ✅ Add to cart
  const handleAddToCart = () => {
    if (!product) {
      message.warning("ยังไม่มีข้อมูลสินค้า");
      return;
    }
    if (!selectedColor || !selectedSize) {
      message.warning("กรุณาเลือกสีและขนาด");
      return;
    }

    // ส่งข้อมูลไปยัง cart (ตรงนี้คุณจะเชื่อม backend หรือ Redux ก็ได้)
    console.log("Added to cart:", {
      product_id: product.id,
      color: selectedColor,
      size: selectedSize,
    });
    message.success("เพิ่มสินค้าไปยังตะกร้าเรียบร้อย");
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
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={product?.variants?.[0]?.picture || "/no-image.png"}
              alt={product?.product_name || "no-name"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Card>
        </Col>

        {/* รายละเอียดสินค้า */}
        <Col
          xs={24}
          md={14}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flexGrow: 1 }}>
            <Title level={3}>{product?.product_name || "No Name"}</Title>
            <Text type="secondary">
              {product?.product_detail || "ไม่มีรายละเอียดสินค้า"}
            </Text>
          </div>

          <div>
            <Divider />

            {/* เลือกสี */}
{availableColors.map((color) => (
  <Button
    key={color.id}
    onClick={() => setSelectedColor(color)}
    type={selectedColor?.id === color.id ? "primary" : "default"}
    style={{ marginLeft: 8 }}
  >
    {color.color || "Unknown"}
  </Button>
))}

{/* เลือกไซส์ */}
{availableSizes.map((size) => (
  <Button
    key={size.id}
    onClick={() => setSelectedSize(size)}
    type={selectedSize?.id === size.id ? "primary" : "default"}
    style={{ marginLeft: 8 }}
  >
    {size.size || "Unknown"}
  </Button>
))}

            <Divider style={{ marginTop: 16, marginBottom: 16 }} />

            {/* ราคา + ปุ่มตะกร้า */}
            <Title level={4}>
              THB {product?.product_price?.toLocaleString() || 0}
            </Title>
            <Button
              type="primary"
              size="large"
              style={{
                marginTop: 6,
                width: "30%",
                backgroundColor: "#FF2F28",
              }}
              onClick={handleAddToCart}
              disabled={loading}
            >
              <ShoppingCartOutlined
                style={{
                  fontSize: 24,
                  color: "white",
                  cursor: "pointer",
                }}
              />
              Add to Cart
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ProductDetailPage;
