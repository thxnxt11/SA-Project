import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../../component/layout/navbar";
import { useNavigate, useParams } from "react-router-dom";
import type { ConcertInterface } from "../../../interface/concert";
import {
  Button,
  Card,
  Col,
  Divider,
  Grid,
  message,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { FaRegCalendarAlt, FaRegClock, FaDollarSign } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { LuTicket } from "react-icons/lu";
import { concertAPI } from "../../../services/https";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// --------- helpers ---------
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
  const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const parseLocalYMD = (s: string): Date => {
  const ymd = s.split("T")[0] || s;
  const [y, m, d] = ymd.split(/[-/]/).map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
};

// --------- component ---------
const ConcertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [concert, setConcert] = useState<ConcertInterface | null>(null);
  const [loading, setLoading] = useState(false);

  const dateRangeText = useMemo(
    () =>
      toUpperMonthRange(concert?.ShowDates?.map((sd) => sd?.show_date) ?? []),
    [concert]
  );

  const isOnSaleStarted = (onsaleDate?: string): boolean => {
    if (!onsaleDate) return true; // if no onsale_date, treat as on sale
    const now = new Date();
    const saleDateTime = new Date(onsaleDate);
    return now >= saleDateTime;
  };

  const isConcertEnded = (showDates?: { show_date: string }[]): boolean => {
    if (!showDates || showDates.length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return showDates.every((sd) => parseLocalYMD(sd.show_date) < today);
  };

  const thb = useMemo(() => new Intl.NumberFormat("th-TH"), []);

  const uniqueSortedPrices = useMemo(() => {
    const firstZones = concert?.ShowDates?.[0]?.Zones ?? [];
    const prices = Array.from(
      new Set(firstZones.map((z: any) => Number(z.zone_price)))
    );
    return prices.sort((a, b) => b - a);
  }, [concert]);

  const ended = useMemo(() => isConcertEnded(concert?.ShowDates), [concert]);
  const onSaleStarted = useMemo(
    () => isOnSaleStarted(concert?.onsale_date),
    [concert]
  );

  const ctaLabel = ended
    ? "Buy Now"
    : onSaleStarted
    ? "Buy Now"
    : "Coming Soon";
  const ctaDisabled = ended || !onSaleStarted;

  const saleTag = ended ? (
    <Tag color="default-inverse">Ended</Tag>
  ) : onSaleStarted ? (
    <Tag color="green-inverse">On sale</Tag>
  ) : (
    <Tag color="gold-inverse">Coming soon</Tag>
  );

  const getVenueName = (venue: any): string => {
    if (!venue) return "";
    if (typeof venue === "string") return venue;
    if (typeof venue === "object") return venue.venue_name || venue.name || "";
    return "";
  };

  const handleBuyNow = () => {
    if (ctaDisabled) {
      message.info(ended ? "คอนเสิร์ตนี้จบแล้ว" : "ยังไม่ถึงเวลาเปิดขาย");
      return;
    }
    if (!concert?.ID) {
      message.error("ไม่พบรหัสคอนเสิร์ต");
      return;
    }
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
      } catch (e) {
        console.error(e);
        message.error("ไม่สามารถโหลดรายละเอียดคอนเสิร์ตได้");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  // --------- render ---------
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 24 }}>
          <Card style={{ borderRadius: 16 }}>
            <Skeleton active avatar paragraph={{ rows: 8 }} />
          </Card>
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

  const coverUrl = `http://localhost:8000${concert.concert_poster_url}`;

  return (
    <>
      <Navbar />
      <div
        style={{
          padding: screens.xs ? 12 : 24,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 1400,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Row gutter={[0, 0]} wrap>
            {/* Left: Poster with subtle overlay */}
            <Col xs={24} md={10} style={{ position: "relative" }}>
              <div
                style={{ position: "relative", height: screens.md ? 520 : 500 }}
              >
                <img
                  alt={concert.concert_name || "Concert"}
                  src={coverUrl}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-image.jpg";
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "50% 100%",
                    display: "block",
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.35) 100%)",
                  }}
                />
                {/* floating badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  {saleTag}
                </div>
              </div>
            </Col>

            {/* Right: Details */}
            <Col xs={24} md={14} style={{ background: "#fff" }}>
              <div
                style={{
                  padding: screens.xs
                    ? "18px 18px 20px"
                    : "28px 36px 28px 36px",
                  minHeight: screens.md ? 480 : 420,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    textAlign: screens.xs ? "left" : "center",
                  }}
                >
                  {concert.concert_name}
                </Title>

                <Divider
                  style={{ margin: screens.xs ? "8px 0 12px" : "10px 0 16px" }}
                />

                {/* Date & Time */}
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <InfoRow icon={<FaRegCalendarAlt />}>
                    <Text strong style={{ fontSize: 18 }}>
                      {dateRangeText}
                    </Text>
                  </InfoRow>

                  <InfoRow icon={<FaRegClock />}>
                    <Text strong style={{ fontSize: 18 }}>
                      {extractTime(concert?.ShowDates?.[0]?.show_date)}
                    </Text>
                  </InfoRow>

                  {getVenueName(concert.venue) && (
                    <InfoRow icon={<FaLocationDot />}>
                      <Text strong style={{ fontSize: 18 }}>
                        {getVenueName(concert.venue)}
                      </Text>
                    </InfoRow>
                  )}

                  {!!uniqueSortedPrices.length && (
                    <InfoRow icon={<FaDollarSign />}>
                      <Space wrap style={{ fontSize: 18 }}>
                        {uniqueSortedPrices.map((p) => (
                          <Text key={p} style={{ fontSize: 18 }}>
                            {thb.format(p)} /
                          </Text>
                        ))}
                        THB
                      </Space>
                    </InfoRow>
                  )}

                  <InfoRow icon={<LuTicket />}>
                    <div>
                      <Text strong style={{ fontSize: 18 }}>
                        Ticket sale date:{" "}
                        {concert?.onsale_date
                          ? new Date(concert.onsale_date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </Text>
                      <br />
                      <Text strong style={{ fontSize: 18 }}></Text>
                    </div>
                  </InfoRow>
                </Space>

                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<LuTicket />}
                    onClick={handleBuyNow}
                    disabled={ctaDisabled}
                    style={{
                      paddingInline: 28,
                      borderRadius: 12,
                      boxShadow: ctaDisabled
                        ? "none"
                        : "0 6px 16px rgba(24,144,255,0.25)",
                    }}
                  >
                    {ctaLabel}
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
};

// Small presentational row for icon + content
const InfoRow: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "24px 1fr",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
      }}
    >
      {icon}
    </div>
    <div>{children}</div>
  </div>
);

export default ConcertDetail;
