import React, { useMemo, useRef } from "react";
import { Row, Col, Card, Typography, Carousel, Tag, Tooltip } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import {
  GiftOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import ArrowButton from "../component/arrowCarouse";
import type { PromotionInterface } from "../interface/promotion";

const { Title, Paragraph, Text } = Typography;

type Props = {
  promotions: PromotionInterface[];
};

const parseDate = (s?: string) => {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
};

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

const typeExplain = (typeStr?: string) => {
  const t = (typeStr || "").toLowerCase();
  if (t === "concert") {
    return {
      color: "volcano-inverse" as const,
      label: "Concert",
      explain: "ใช้ได้เฉพาะการซื้อบัตรคอนเสิร์ตของ",
    };
  }
  if (t === "code") {
    return {
      color: "purple-inverse" as const,
      label: "Code",
      explain: "ใช้ได้เฉพาะการซื้อของสะสมเท่านั้น!! ",
    };
  }
  return {
    color: "default" as const,
    label: "type: -",
    explain: "ไม่ระบุประเภท",
  };
};

const PromotionSection: React.FC<Props> = ({ promotions }) => {
  const sliderRef = useRef<CarouselRef>(null);

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

  const promoPerSlide = 2;
  const promoSlides = useMemo(() => {
    const items = visiblePromotions;
    const out: any[][] = [];
    for (let i = 0; i < items.length; i += promoPerSlide) {
      out.push(items.slice(i, i + promoPerSlide));
    }
    return out;
  }, [visiblePromotions]);

  return (
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
          <ArrowButton
            direction="left"
            onClick={() => sliderRef.current?.prev()}
          />
          <ArrowButton
            direction="right"
            onClick={() => sliderRef.current?.next()}
          />

          <Carousel ref={sliderRef} dots={false} infinite>
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
                        lg={10}
                        xl={10}
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <Card
                          hoverable
                          style={{
                            borderRadius: 12,
                            overflow: "hidden",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                            cursor: "default",
                            width: 500,
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

                              <Title
                                level={5}
                                style={{ marginTop: 5 }}
                                ellipsis={{ rows: 2 }}
                              >
                                {name}
                              </Title>

                              <Tooltip title={explain}>
                                <Paragraph
                                  type="secondary"
                                  ellipsis={{ rows: 2 }}
                                  style={{ marginTop: 5 }}
                                >
                                  {explain}
                                  {p?.concert?.artist
                                    ? ` ${p.concert.artist}`
                                    : ""}
                                </Paragraph>
                              </Tooltip>

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

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 4,
                                  marginTop: 6,
                                  paddingTop: 8,
                                  borderTop: "1px dashed #eee",
                                }}
                              >
                                <Text style={{ marginTop: 8 }}>
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
  );
};

export default PromotionSection;
