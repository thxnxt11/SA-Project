import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Spin,
  message,
  Button,
  Carousel,
  Grid,
  Tag,
  Tooltip,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  GiftOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../component/layout/navbar";
import type { ConcertInterface } from "../../interface/concert";
import { concertAPI, promotionAPI } from "../../services/https";
import type { CarouselRef } from "antd/es/carousel";
import type { PromotionInterface } from "../../interface/promotion";

const { Title, Text, Paragraph } = Typography;

// ---------- helpers สำหรับโปรโมชั่น ----------
const parseDate = (s?: string) => {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
};

// now อยู่ในช่วง [start, end] (รวมวัน end แบบ end-of-day)
const isNowWithin = (start?: Date, end?: Date) => {
  const now = new Date();
  const endInclusive = end ? new Date(end.getTime()) : undefined;
  if (endInclusive) endInclusive.setHours(23, 59, 59, 999);
  const afterStart = !start || now >= start;
  const beforeEnd = !endInclusive || now <= endInclusive;
  return afterStart && beforeEnd;
};

const formatDate = (d?: Date) =>
  d
    ? d.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

// map type → label/คำอธิบาย + สี
const typeExplain = (typeStr?: string) => {
  const t = (typeStr || "").toLowerCase();
  if (t === "concert") {
    return {
      color: "volcano-inverse" as const,
      label: "Concert",
      explain:
        "ใช้ได้ทั้งการซื้อบัตรคอนเสิร์ตและของสะสมที่เกี่ยวข้องกับคอนเสิร์ตของ",
    };
  }
  if (t === "code") {
    return {
      color: "purple-inverse" as const,
      label: "Code",
      explain:
        "ใช้ได้เฉพาะการซื้อของสะสมเท่านั้น!! ไม่สามารถใช้ซื้อบัตรคอนเสิร์ตได้",
    };
  }
  return {
    color: "default" as const,
    label: "type: -",
    explain: "ไม่ระบุประเภท",
  };
};

const HomePage: React.FC = () => {
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [promotions, setPromotions] = useState<PromotionInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const concertCarouselRef = useRef<CarouselRef>(null);
  const promoCarouselRef = useRef<CarouselRef>(null);

  useEffect(() => {
    const fetchConcerts = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await concertAPI.getAll();
        if (!response || response.status !== 200) {
          throw new Error(
            `Failed to fetch concerts: ${response?.status || "Unknown error"}`
          );
        }

        const data: ConcertInterface[] = response.data || [];
        setConcerts(data);
      } catch (err) {
        console.error("Error fetching concerts:", err);
        message.error("ไม่สามารถโหลดข้อมูลคอนเสิร์ตได้");
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
  }, []);

  useEffect(() => {
    const fetchPromotion = async (): Promise<void> => {
      setLoading(true);
      try {
        const PromotionRes = await promotionAPI.getAll();
        if (!PromotionRes || PromotionRes.status !== 200) {
          throw new Error(
            `Failed to fetch Promotion: ${PromotionRes?.status} || "Unknow error"`
          );
        }
        const PromoData: PromotionInterface[] = PromotionRes.data || [];
        setPromotions(PromoData);
      } catch (err) {
        console.error("Error fetching Promotions:", err);
        message.error("ไม่สามารถโหลดข้อมูลโปรโมชั่นได้");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotion();
  }, []);

  const handleConcertClick = (concertId: number): void => {
    if (!concertId) {
      message.error("ไม่สามารถเปิดหน้ารายละเอียดคอนเสิร์ตได้");
      return;
    }
    navigate(`/concert/${concertId}`);
  };

  const formatDateRange = (dates: string[]): string => {
    if (!dates || dates.length === 0) return "ไม่ระบุวันที่";
    const parsed = dates
      .map((d) => new Date(d))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (parsed.length === 0) return "ไม่ระบุวันที่";

    const first = parsed[0];
    const last = parsed[parsed.length - 1];

    if (
      first.getMonth() === last.getMonth() &&
      first.getFullYear() === last.getFullYear()
    ) {
      return `${first.getDate()}–${last.getDate()} ${first.toLocaleString(
        "en-US",
        { month: "long" }
      )} ${first.getFullYear()}`;
    }

    const firstStr = first.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const lastStr = last.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return `${firstStr} – ${lastStr}`;
  };

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

  const isOnSaleStarted = (onsaleDate?: string): boolean => {
    if (!onsaleDate) return true;
    const now = new Date();
    const saleDateTime = new Date(onsaleDate);
    return now >= saleDateTime;
  };

  const getButtonState = (concert: ConcertInterface) => {
    const ended = isConcertEnded(concert.ShowDates);
    const onSaleStarted = isOnSaleStarted(concert.onsale_date);

    if (ended) {
      return {
        text: "Concert End",
        disabled: true,
        type: "default" as const,
        clickable: false,
      };
    } else if (!onSaleStarted) {
      return {
        text: "Coming Soon",
        disabled: false,
        type: "default" as const,
        clickable: true,
      };
    } else {
      return {
        text: "BuyNow",
        disabled: false,
        type: "primary" as const,
        clickable: true,
      };
    }
  };

  const perSlide = screens.xl ? 5 : screens.md ? 2 : 1;

  const concertslides = useMemo(() => {
    const out: ConcertInterface[][] = [];
    for (let i = 0; i < concerts.length; i += perSlide) {
      out.push(concerts.slice(i, i + perSlide));
    }
    return out;
  }, [concerts, perSlide]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div
          style={{
            padding: "20px 40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <Spin size="large" />
        </div>
      </>
    );
  }
  const showConcerts = useMemo(
    () => concerts.filter((c) => !isConcertEnded(c.ShowDates)),
    [concerts]
  );

  // ---------- เตรียมข้อมูลโปรที่จะแสดง ----------
  // เงื่อนไข: promotion_status = "Active" และอยู่ในช่วง start_date - end_date
  const visiblePromotions = useMemo(() => {
    return (promotions || []).filter((p: any) => {
      const statusOk =
        String(p?.promotion_status || "").toLowerCase() === "active";
      if (!statusOk) return false;

      const start = parseDate(p?.start_date);
      const end = parseDate(p?.end_date);
      return isNowWithin(start, end);
    });
  }, [promotions]);

  const promoPerSlide = screens.xl ? 2 : 1;
  const promoSlides = useMemo(() => {
    const items = visiblePromotions;
    const out: any[][] = [];
    for (let i = 0; i < items.length; i += promoPerSlide) {
      out.push(items.slice(i, i + promoPerSlide));
    }
    return out;
  }, [visiblePromotions, promoPerSlide]);
  return (
    <>
      <Navbar />
      {showConcerts.length > 0 && (
        <div style={{ position: "relative" }}>
          <Carousel
            autoplay={{ dotDuration: true }}
            autoplaySpeed={3000}
            arrows
            infinite={true}
          >
            {showConcerts.slice(0, 10).map((concert) => {
              const imgUrl = concert?.concert_poster_url
                ? `http://localhost:8000${concert.concert_poster_url}`
                : "/placeholder-image.jpg";

              return (
                <div key={concert.ID}>
                  <div
                    onClick={() =>
                      concert?.ID && navigate(`/concert/${concert.ID}`)
                    }
                    style={{
                      height: 580,
                      width: "100%",
                      cursor: "pointer",
                      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.55)), url('${imgUrl}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "50% 60%", //แกน x 50%, แกน y 60%
                      backgroundRepeat: "no-repeat",
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: 1300,
                        margin: "0 auto",
                        padding: "16px 24px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: 16,
                      }}
                    >
                      <div style={{ color: "#fff", maxWidth: "70%" }}>
                        <Title
                          level={2}
                          style={{ color: "#fff", margin: 0 }}
                          ellipsis={{ rows: 1 }}
                        >
                          {concert.concert_name || "Untitled Concert"}
                        </Title>
                        {concert.artist && (
                          <Paragraph
                            style={{ color: "#eaeaea", margin: "6px 0 0" }}
                            ellipsis={{ rows: 2 }}
                          >
                            {concert.artist}
                          </Paragraph>
                        )}
                        {concert.ShowDates?.length ? (
                          <Paragraph
                            style={{ color: "#eaeaea", margin: "6px 0 0" }}
                            ellipsis={{ rows: 2 }}
                          >
                            {formatDateRange(
                              concert.ShowDates.map((sd) => sd.show_date)
                            )}
                          </Paragraph>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Carousel>
        </div>
      )}

      {/* ======= Recommended Concerts ======= */}
      <div style={{ padding: "20px 40px", position: "relative" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            margin: "0 10%",
          }}
        >
          <Title level={2}>🎶 Recommended Concerts</Title>
          <Link to="/concerts">
            <Text
              style={{
                fontSize: "18px",
                color: "#001a4d",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              All Concert
            </Text>
          </Link>
        </div>

        {concertslides.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Paragraph type="secondary">ไม่พบข้อมูลคอนเสิร์ต</Paragraph>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* ปุ่มซ้าย */}
            <Button
              shape="circle"
              size="large"
              icon={<LeftOutlined />}
              onClick={() => concertCarouselRef.current?.prev()}
              style={{
                position: "absolute",
                top: "40%",
                left: "20px",
                zIndex: 10,
                background: "rgba(0,0,0,0.6)",
                borderColor: "transparent",
                color: "#fff",
              }}
            />

            {/* ปุ่มขวา */}
            <Button
              shape="circle"
              size="large"
              icon={<RightOutlined />}
              onClick={() => concertCarouselRef.current?.next()}
              style={{
                position: "absolute",
                top: "40%",
                right: "20px",
                zIndex: 10,
                background: "rgba(0,0,0,0.6)",
                borderColor: "transparent",
                color: "#fff",
              }}
            />

            <Carousel ref={concertCarouselRef} dots={false} infinite={false}>
              {concertslides.map((group, idx) => (
                <div key={idx}>
                  <Row
                    gutter={[16, 20]}
                    justify="center"
                    style={{ maxWidth: 1300, margin: "0 auto", marginTop: 18 }}
                  >
                    {group.map((concert) => {
                      const buttonState = getButtonState(concert);

                      const baseBtnStyle: React.CSSProperties = {
                        height: 48,
                        fontSize: 18,
                        width: 230,
                        borderRadius: 15,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      };
                      const grayBtnStyle: React.CSSProperties = {
                        ...baseBtnStyle,
                        backgroundColor: "#d9d9d9",
                        borderColor: "#d9d9d9",
                        color: "#fff",
                      };

                      return (
                        <Col key={concert.ID}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <Card
                              hoverable={buttonState.clickable}
                              cover={
                                <img
                                  alt={concert.concert_name || "Concert"}
                                  src={`http://localhost:8000${concert.concert_poster_url}`}
                                  style={{ height: 280, objectFit: "cover" }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder-image.jpg";
                                  }}
                                />
                              }
                              style={{
                                width: 230,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                cursor: buttonState.clickable
                                  ? "pointer"
                                  : "not-allowed",
                                opacity: buttonState.clickable ? 1 : 0.9,
                              }}
                              onClick={() =>
                                buttonState.clickable &&
                                handleConcertClick(concert.ID)
                              }
                            >
                              <div
                                style={{
                                  minHeight: 135,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "flex-start",
                                }}
                              >
                                <Title level={5} ellipsis={{ rows: 2 }}>
                                  {concert.concert_name ||
                                    "ไม่ระบุชื่อคอนเสิร์ต"}
                                </Title>

                                {concert.artist && (
                                  <Paragraph type="secondary" ellipsis>
                                    {concert.artist}
                                  </Paragraph>
                                )}

                                {concert.ShowDates && (
                                  <Paragraph
                                    style={{ marginBottom: 0 }}
                                    ellipsis={{ rows: 2 }}
                                  >
                                    📅{" "}
                                    {formatDateRange(
                                      concert.ShowDates.map(
                                        (sd) => sd.show_date
                                      )
                                    )}
                                  </Paragraph>
                                )}
                              </div>
                            </Card>

                            <Button
                              onClick={() =>
                                buttonState.clickable &&
                                handleConcertClick(concert.ID)
                              }
                              type={buttonState.type}
                              size="large"
                              disabled={buttonState.disabled}
                              style={
                                buttonState.disabled
                                  ? grayBtnStyle
                                  : baseBtnStyle
                              }
                            >
                              {buttonState.text}
                            </Button>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              ))}
            </Carousel>
          </div>
        )}
      </div>

      {/* ======= Promotions ======= */}
      <div style={{ padding: "20px 40px", position: "relative" }}>
        <Title level={2} style={{ marginBottom: 24, marginLeft: "10%" }}>
          🎟️ Promotion Code
        </Title>

        {visiblePromotions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 0 32px" }}>
            <Paragraph type="secondary">
              ยังไม่มีโปรโมชั่นที่ใช้งานได้ในขณะนี้
            </Paragraph>
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* ปุ่มเลื่อนซ้าย/ขวา */}
            <Button
              shape="circle"
              size="large"
              icon={<LeftOutlined />}
              onClick={() => promoCarouselRef.current?.prev()}
              style={{
                position: "absolute",
                top: "40%",
                left: "20px",
                zIndex: 10,
                background: "rgba(0,0,0,0.6)",
                borderColor: "transparent",
                color: "#fff",
              }}
            />
            <Button
              shape="circle"
              size="large"
              icon={<RightOutlined />}
              onClick={() => promoCarouselRef.current?.next()}
              style={{
                position: "absolute",
                top: "40%",
                right: "20px",
                zIndex: 10,
                background: "rgba(0,0,0,0.6)",
                borderColor: "transparent",
                color: "#fff",
              }}
            />

            <Carousel ref={promoCarouselRef} dots={false} infinite={true}>
              {promoSlides.map((group, idx) => (
                <div key={idx}>
                  <Row
                    gutter={[48, 48]}
                    justify="center"
                    style={{ maxWidth: 1300, margin: "0 auto" }}
                  >
                    {group.map((p: any) => {
                      const id = p?.ID ?? Math.random();
                      const name = p?.promotion_name || "ไม่ระบุชื่อโปรโมชั่น";
                      const desc = p?.promotion_description || "";
                      const code = p?.promotion_code || "";
                      const start = parseDate(p?.start_date);
                      const end = parseDate(p?.end_date);

                      const typeString = (
                        p?.promotion_type?.promotion_type || ""
                      ).toLowerCase();
                      const { color, label, explain } = typeExplain(typeString);

                      const posterUrlRaw =
                        p?.poster_url ||
                        p?.concert?.concert_poster_url ||
                        "/placeholder-image.jpg";
                      const posterUrl =
                        posterUrlRaw?.startsWith("/uploads") ||
                        posterUrlRaw?.startsWith("/")
                          ? `http://localhost:8000${posterUrlRaw}`
                          : posterUrlRaw;

                      const limitOk =
                        typeof p?.limit === "number" &&
                        typeof p?.used_count === "number"
                          ? p.used_count < p.limit
                          : true;
                      if (!limitOk) return null;

                      const usedPercent =
                        typeof p?.limit === "number" && p.limit > 0
                          ? Math.round((p.used_count / p.limit) * 100)
                          : undefined;

                      return (
                        <Col
                          key={id}
                          xs={24}
                          sm={24}
                          md={20}
                          lg={promoPerSlide === 2 ? 10 : 20}
                          xl={promoPerSlide === 2 ? 10 : 20}
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <Card
                            hoverable
                            style={{
                              borderRadius: 12,
                              overflow: "hidden",
                              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                              cursor: "default",
                              width: 500, // คุมให้สองใบวางพอดีใน 1300px
                            }}
                            bodyStyle={{ padding: 0 }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: 1,
                                alignItems: "stretch",
                              }}
                            >
                              {/* รูปด้านซ้าย */}
                              <img
                                src={posterUrl}
                                alt={name}
                                style={{
                                  width: 180,
                                  height: 220,
                                  objectFit: "cover",
                                  borderRadius: "11px 0 0 11px",
                                  flexShrink: 0,
                                }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    "/placeholder-image.jpg";
                                }}
                              />

                              {/* รายละเอียดด้านขวา */}
                              <div
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  padding: 12,
                                  paddingLeft: 24,
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {/* แถวบน: ประเภท + โค้ด + ส่วนลด */}
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                    marginBottom: 4,
                                  }}
                                >
                                  <Tag color={color} style={{ margin: 0 }}>
                                    {label}
                                  </Tag>
                                  {code ? (
                                    <Tag
                                      color="cyan-inverse"
                                      style={{ margin: 0 }}
                                    >
                                      <GiftOutlined /> รหัส:{" "}
                                      <b style={{ marginLeft: 6 }}>{code}</b>
                                    </Tag>
                                  ) : null}
                                  {typeof p?.discount === "number" ? (
                                    <Tag
                                      color="green-inverse"
                                      style={{ margin: 0 }}
                                    >
                                      {p.discount}% off
                                    </Tag>
                                  ) : null}
                                </div>

                                {/* ชื่อโปร */}
                                <Title
                                  level={5}
                                  style={{ margin: 0 }}
                                  ellipsis={{ rows: 2 }}
                                >
                                  {name}
                                </Title>

                                {/* อธิบายว่าใช้ส่วนลดนี้กับอะไรได้บ้าง */}
                                <Tooltip title={explain}>
                                  <Paragraph
                                    type="secondary"
                                    ellipsis={{ rows: 2 }}
                                  >
                                    {explain}
                                    {p?.concert?.artist
                                      ? ` ${p.concert.artist}`
                                      : ""}
                                  </Paragraph>
                                </Tooltip>

                                {/* คำอธิบายโปร */}
                                {desc ? (
                                  <Paragraph
                                    style={{ margin: "0px 0 0" }}
                                    ellipsis={{
                                      rows: 2,
                                      expandable: true,
                                      symbol: "เพิ่มเติม",
                                    }}
                                  >
                                    <InfoCircleOutlined /> {desc}
                                  </Paragraph>
                                ) : null}

                                {/* วันที่ใช้งาน + โควตา */}
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                    marginTop: 8,
                                    paddingTop: 8,
                                    borderTop: "1px dashed #eee",
                                  }}
                                >
                                  <Text>
                                    <CalendarOutlined /> ใช้ได้ตั้งแต่:{" "}
                                    <b>
                                      {formatDate(start)} - {formatDate(end)}
                                    </b>
                                  </Text>
                                  {usedPercent !== undefined ? (
                                    <Text
                                      type="secondary"
                                      style={{ color: "#ff0000" }}
                                    >
                                      ใช้ไปแล้ว {usedPercent}%
                                    </Text>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              ))}
            </Carousel>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
