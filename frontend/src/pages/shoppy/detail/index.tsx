import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Typography, Button, Divider, message } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import type { ProductInterface } from "../../../interface/product";
import type { ColorInterface } from "../../../interface/color";
import type { SizeInterface } from "../../../interface/size";
import { productsAPI, cartAPI } from "../../../services/https";
import { useAuth } from "../../../hook/authContext";


const { Title, Text } = Typography;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productID = Number(id);
  const [product, setProduct] = useState<ProductInterface | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorInterface | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { user } = useAuth(); 
  const user_id = Number(user?.id);   

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await productsAPI.getByProductID(productID);
        console.log(res.data);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        message.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const availableColors: ColorInterface[] = Array.from(
    new Map(
      (product?.variants || [])
        .map(v => v.color)
        .filter((c): c is ColorInterface => !!c && c.id != null && !!c.color)
        .map(c => [c.id, c])
    ).values()
  );

  const availableSizes: SizeInterface[] = Array.from(
    new Map(
      (product?.variants || [])
        .map(v => v.size)
        .filter((s): s is SizeInterface => !!s && s.id != null && !!s.size)
        .sort((a, b) => (a.id! - b.id!))
        .map(s => [s.id, s])
    ).values()
  );

  const handleAddToCart = async () => {
    if (!product) {
      message.warning("ยังไม่มีข้อมูลสินค้า");
      return;
    }
    if (!selectedColor || !selectedSize) {
      message.warning("กรุณาเลือกสีและขนาด");
      return;
    }
    if (!user_id) {
      message.error("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้า");
      return;
    }

    const matchedVariant = product.variants?.find(
      v => v.color?.id === selectedColor.id && v.size?.id === selectedSize.id
    );

    if (!matchedVariant) {
      message.error("ไม่พบสินค้าที่เลือกในสต๊อก");
      return;
    }

    try {
      setLoading(true);
      await cartAPI.addToCart({
        user_id,
        variant_id: matchedVariant.id!,
        quantity: 1,
      });
      message.success("เพิ่มสินค้าไปยังตะกร้าเรียบร้อย");
    } catch (err) {
      console.error(err);
      message.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 1000, margin: "40px auto", padding: 24 }}>
      <Row gutter={[32, 32]}>
        {/* รูปสินค้า */}
        <Col xs={24} md={10}>
          <Card
            style={{
              width: 270,
              height: 380,
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
              style={{ height: "380px", objectFit: "cover" }}
            />
          </Card>
        </Col>

        {/* รายละเอียดสินค้า */}
        <Col
          xs={24}
          md={14}
          style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
        >
          <div style={{ flexGrow: 1 }}>
            <Title level={3}>{product?.product_name || "No Name"}</Title>
            <Text type="secondary">{product?.product_detail || "ไม่มีรายละเอียดสินค้า"}</Text>
          </div>

          <div>
            <Divider />

            {/* เลือกสี */}
            {availableColors.length > 0 && (
              <>
                <Text strong>Select Color:</Text>
                {availableColors.map((color) => (
                  <Button
                    key={`color-${color.id}`}
                    onClick={() => setSelectedColor(color)}
                    type={selectedColor?.id === color.id ? "primary" : "default"}
                    style={{ marginLeft: 8 }}
                  >
                    {color?.color || "Unknown"}
                  </Button>
                ))}
              </>
            )}

            {/* เลือกไซส์ */}
            {availableSizes.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Select Size:</Text>
                {availableSizes.map((size) => (
                  <Button
                    key={`size-${size.id}`}
                    onClick={() => setSelectedSize(size)}
                    type={selectedSize?.id === size.id ? "primary" : "default"}
                    style={{ marginLeft: 8 }}
                  >
                    {size?.size || "Unknown"}
                  </Button>
                ))}
              <Divider style={{ marginTop: 16, marginBottom: 16 }} />
              </div>
            )}

            {/* ราคา + ปุ่มตะกร้า */}
            <Title level={4}>THB {product?.product_price?.toLocaleString() || 0}</Title>
            <Button
              type="primary"
              size="large"
              style={{ marginTop: 6, width: "30%", backgroundColor: "#FF2F28" }}
              onClick={handleAddToCart}
              disabled={loading}
            >
              <ShoppingCartOutlined style={{ fontSize: 24, color: "white", cursor: "pointer" }} />
              Add to Cart
            </Button>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ProductDetailPage;