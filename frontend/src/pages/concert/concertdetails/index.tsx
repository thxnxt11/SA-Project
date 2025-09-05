import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../../component/layout/navbar";
import { useNavigate, useParams } from "react-router-dom";
import type { ConcertInterface } from "../../../interface/concert";
import {
  Button,
  Card,
  Col,
  Divider,
  message,
  Row,
  Spin,
  Typography,
} from "antd";
import { FaRegCalendarAlt, FaRegClock, FaDollarSign } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { concertAPI } from "../../../services/https";

const toUpperMonthRange = (isoDates: (string | undefined)[]): string => {
  const parsed = isoDates
    ?.filter(Boolean)
    .map((d) => new Date(String(d)))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (!parsed?.length) return "-";
  const first = parsed[0];
  const last = parsed[parsed.length - 1];
  const mon = (d: Date) =>
    d.toLocaleString("en-US", { month: "long" }).toUpperCase();

  if (
    first.getMonth() === last.getMonth() &&
    first.getFullYear() === last.getFullYear()
  ) {
    return `${first.getDate()}–${last.getDate()} ${mon(
      first
    )} ${first.getFullYear()}`;
  }
  const f = `${first.getDate()} ${mon(first)} ${first.getFullYear()}`;
  const l = `${last.getDate()} ${mon(last)} ${last.getFullYear()}`;
  return `${f} – ${l}`;
};
const extractTime = (raw?: string): string => {
  if (!raw) return "—";

  // รับทั้ง "YYYY-MM-DD HH:MM:SS" และ ISO
  const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const { Paragraph } = Typography;

const ConcertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [concert, setConcert] = useState<ConcertInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const dateRangeText = useMemo(
    () =>
      toUpperMonthRange(concert?.ShowDates?.map((sd) => sd?.show_date) ?? []),
    [concert]
  );

  // เพิ่มฟังก์ชันเช็ควันขาย
  const isOnSaleStarted = (onsaleDate?: string): boolean => {
    if (!onsaleDate) return true; // ถ้าไม่มี onsale_date ให้ถือว่าขายได้
    const now = new Date();
    const saleDateTime = new Date(onsaleDate);
    return now >= saleDateTime;
  };

  // เพิ่มฟังก์ชันเช็คว่าคอนเสิร์ตจบแล้วหรือยัง
  const parseLocalYMD = (s: string): Date => {
    const ymd = s.split("T")[0] || s;
    const [y, m, d] = ymd.split(/[-/]/).map((n) => parseInt(n, 10));
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const isConcertEnded = (showDates?: { show_date: string }[]): boolean => {
    if (!showDates || showDates.length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return showDates.every((sd) => parseLocalYMD(sd.show_date) < today);
  };

  // ฟังก์ชันกำหนดสถานะปุ่ม
  const getButtonState = () => {
    if (!concert) return { text: "Buy Now", disabled: true, clickable: false };

    const ended = isConcertEnded(concert.ShowDates);
    const onSaleStarted = isOnSaleStarted(concert.onsale_date);

    if (ended) {
      return {
        text: "Buy Now",
        disabled: true,
        clickable: false,
        style: {
          backgroundColor: "#d9d9d9",
          borderColor: "#d9d9d9",
          color: "#fff",
          cursor: "not-allowed",
        },
      };
    } else if (!onSaleStarted) {
      return {
        text: "Coming Soon",
        disabled: true,
        clickable: false,
        style: {
          backgroundColor: "#d9d9d9",
          borderColor: "#d9d9d9",
          color: "#fff",
          cursor: "not-allowed",
        },
      };
    } else {
      return {
        text: "Buy Now",
        disabled: false,
        clickable: true,
        style: {},
      };
    }
  };

  const handleBuyNow = () => {
    const buttonState = getButtonState();

    if (!buttonState.clickable) {
      if (buttonState.text === "Coming Soon") {
        message.info("ยังไม่ถึงเวลาเปิดขาย");
      } else {
        message.info("คอนเสิร์ตนี้จบแล้ว");
      }
      return;
    }

    if (!concert?.ID) {
      message.error("ไม่พบรหัสคอนเสิร์ต");
      return;
    }

    // ไปหน้า selectzone แบบ path ต่อจาก concert/:id
    navigate(`/concert/${concert.ID}/selectzone`);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        message.error("ไม่พบคอนเสิร์ต");
        navigate("/");
        return;
      }

      setLoading(true);
      try {
        const response = await concertAPI.getById(Number(id));

        if (!response || response.status !== 200) {
          throw new Error(
            `Failed to fetch concert: ${response?.status || "Unknown error"}`
          );
        }

        const data: ConcertInterface = response.data || response;
        setConcert(data);
        console.log("Raw api data:", data);
        console.log("On Sale Date:", data.onsale_date);
        console.log("Is On Sale Started:", isOnSaleStarted(data.onsale_date));
      } catch (e) {
        console.error(e);
        message.error("ไม่สามารถโหลดรายละเอียดคอนเสิร์ตได้");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const getVenueName = (venue: any): string => {
    if (!venue) return "";
    if (typeof venue === "string") {
      return venue;
    }
    if (typeof venue === "object") {
      return venue.venue_name || venue.name || "";
    }
    return "";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div
          style={{
            padding: 24,
            display: "flex",
            justifyContent: "center",
            minHeight: 400,
          }}
        >
          <Spin size="large" />
        </div>
      </>
    );
  }

  if (!concert) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 24, textAlign: "center" }}>
          <Paragraph type="secondary">ไม่พบข้อมูลคอนเสิร์ต</Paragraph>
          <Button onClick={() => navigate(-1)}>← กลับ</Button>
        </div>
      </>
    );
  }

  const thb = new Intl.NumberFormat("th-TH");
  const buttonState = getButtonState();

  return (
    <>
      <Navbar />
      <div style={{ display: "flex", flexDirection: "column", padding: 12 }}>
        <Card
          style={{
            backgroundColor: "#ffffffff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            borderRadius: 16,
            overflow: "hidden",
            padding: 0,
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Row style={{ height: "420px" }}>
            {/* ซ้าย: รูปภาพ */}
            <Col xs={24} md={10} style={{ height: "100%" }}>
              <img
                alt={concert.concert_name || "Concert"}
                src={`http://localhost:8000${concert.concert_poster_url}`}
                style={{
                  width: "110%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "50% 80%",
                  borderRadius: "12px 0 0 12px",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg";
                }}
              />
            </Col>

            {/* ขวา: ข้อมูลคอนเสิร์ต */}
            <Col xs={24} md={14} style={{ height: "100%" }}>
              <div
                style={{
                  padding: "20px 48px 20px 80px", // เพิ่ม padding ซ้ายให้มากขึ้น
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <h1 style={{ marginBottom: "8px", textAlign: "center" }}>
                  {concert.concert_name}
                </h1>
                <Divider style={{ borderColor: "#000000ff" }}></Divider>
                <h2
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "20px",
                    marginBottom: "24px",
                  }}
                >
                  <FaRegCalendarAlt />
                  {dateRangeText}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FaRegClock />
                  {extractTime(concert?.ShowDates?.[0]?.show_date)}
                </h2>
                {getVenueName(concert.venue) && (
                  <h2
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      marginBottom: "24px",
                    }}
                  >
                    <FaLocationDot />
                    {getVenueName(concert.venue)}{" "}
                  </h2>
                )}
                {concert?.ShowDates?.[0]?.Zones && (
                  <h2
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <FaDollarSign />
                    {Array.from(
                      new Set(
                        concert.ShowDates[0].Zones.map((z: any) =>
                          Number(z.zone_price)
                        )
                      )
                    )
                      .sort((a, b) => b - a)
                      .map((price) => thb.format(price))
                      .join(" / ")}{" "}
                    THB
                  </h2>
                )}
                <div
                  style={{
                    marginTop: "auto", // ดันปุ่มลงล่าง
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={handleBuyNow}
                    className="payment-button"
                    style={{
                      padding: "10px 24px",
                      fontSize: "18px",
                      borderRadius: "10px",
                      color: "#fff",
                      border: "none",
                      cursor: buttonState.clickable ? "pointer" : "not-allowed",
                      ...buttonState.style,
                    }}
                  >
                    {buttonState.text}
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
};

export default ConcertDetail;
