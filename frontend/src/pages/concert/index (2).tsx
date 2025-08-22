import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../component/layout/navbar";
import { useNavigate, useParams } from "react-router-dom";
import type { ConcertInterface } from "../../interface/concert";
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
  const handleBuyNow = () => {
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
        const res = await fetch(`http://localhost:8000/api/concert/${id}`);
        if (!res.ok)
          throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        const data: ConcertInterface = await res.json();
        setConcert(data);
        console.log("Raw api data:", data);
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
    if (!venue) return ""; // ถ้า venue เป็น string
    if (typeof venue === "string") {
      return venue;
    } // ถ้า venue เป็น object
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

  return (
    <>
      <Navbar />
      <div
        style={{ display: "flex", flexDirection: "column", padding: "24px" }}
      >
        <Card
          style={{
            backgroundColor: "#e4ecffff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            borderRadius: 12,
            padding: "16px",
          }}
        >
          <Row gutter={[24, 24]} align="middle">
            {/* ซ้าย: Poster */}
            <Col xs={24} md={10}>
              <img
                alt={concert.concert_name || "Concert"}
                src={`http://localhost:8000${concert.concert_poster_url}`}
                style={{
                  width: "100%",
                  height: "420px",
                  objectFit: "cover",
                  objectPosition: "bottom",
                  borderRadius: 12,
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg";
                }}
              />
            </Col>

            {/* ขวา: ข้อมูลคอนเสิร์ต */}
            <Col xs={24} md={14}>
              <div
                style={{
                  //   background: "#dfe8ff",
                  borderRadius: 16,
                  padding: "20px 24px",
                  minHeight: 420,
                }}
              >
                <h1 style={{ marginBottom: "24px", textAlign: "center" }}>
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
                      .sort((a, b) => b - a) // เรียงจากมาก -> น้อย
                      .map((price) => thb.format(price))
                      .join(" / ")}{" "}
                    THB
                  </h2>
                )}
                <div
                  style={{
                    marginTop: "80px",
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
                      cursor: "pointer",
                    }}
                  >
                    Buy Now
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
