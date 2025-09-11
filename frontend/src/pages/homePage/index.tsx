import React, { useEffect, useState } from "react";
import { Spin, message } from "antd";
import Navbar from "../../component/layout/navbar";
import { concertAPI, productsAPI, promotionAPI } from "../../services/https";
import type { ConcertInterface } from "../../interface/concert";
import type { PromotionInterface } from "../../interface/promotion";
import ConcertSection from "../../component/concertSection";
import PromotionSection from "../../component/promotionSection";
import ProductSection from "../../component/productSection";

const HomePage: React.FC = () => {
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [promotions, setPromotions] = useState<PromotionInterface[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const doFetch = async () => {
      setLoading(true);
      try {
        const [concertRes, promoRes, productRes] = await Promise.allSettled([
          concertAPI.getAll(),
          promotionAPI.getAll(),
          productsAPI.getAllProducts(),
        ]);

        if (
          concertRes.status === "fulfilled" &&
          concertRes.value?.status === 200
        ) {
          setConcerts(concertRes.value.data || []);
        } else {
          message.error("ไม่สามารถโหลดข้อมูลคอนเสิร์ตได้");
        }

        if (promoRes.status === "fulfilled" && promoRes.value?.status === 200) {
          setPromotions(promoRes.value.data || []);
        } else {
          message.error("ไม่สามารถโหลดข้อมูลโปรโมชั่นได้");
        }

        if (productRes.status === "fulfilled") {
          setProducts(productRes.value.data || []);
        } else {
          message.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
        }
      } catch (err) {
        console.error(err);
        message.error("โหลดข้อมูลล้มเหลว");
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin size="large" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ConcertSection concerts={concerts} />
      <PromotionSection promotions={promotions} />
      <ProductSection products={products} />
    </>
  );
};

export default HomePage;
