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
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/layout/navbar";
import type { ConcertInterface } from "../../interface/concert";
import { concertAPI } from "../../services/https";
import type { CarouselRef } from "antd/es/carousel";

const { Title, Paragraph } = Typography;

const Concert: React.FC = () => {
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const carouselRef = useRef<CarouselRef>(null);

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
        setConcerts(data.slice(0, 12));
      } catch (err) {
        console.error("Error fetching concerts:", err);
        message.error("ไม่สามารถโหลดข้อมูลคอนเสิร์ตได้");
      } finally {
        setLoading(false);
      }
    };

    fetchConcerts();
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

  const perSlide = screens.xl ? 3 : screens.md ? 2 : 1;

  const slides = useMemo(() => {
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

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px 40px", position: "relative" }}>
        <Title level={2} style={{ marginBottom: 24, marginLeft: "6%" }}>
          🎶 Recommended Concerts
        </Title>

        {slides.length === 0 ? (
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
              onClick={() => carouselRef.current?.prev()}
              style={{
                position: "absolute",
                top: "40%",
                left: "50px",
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
              onClick={() => carouselRef.current?.next()}
              style={{
                position: "absolute",
                top: "40%",
                right: "50px",
                zIndex: 10,
                background: "rgba(0,0,0,0.6)",
                borderColor: "transparent",
                color: "#fff",
              }}
            />

            <Carousel ref={carouselRef} dots={false} infinite={false}>
              {slides.map((group, idx) => (
                <div key={idx}>
                  <Row
                    gutter={[16, 20]}
                    justify="center"
                    style={{ maxWidth: 1300, margin: "0 auto" }}
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
                              <Title level={5} ellipsis={{ rows: 2 }}>
                                {concert.concert_name || "ไม่ระบุชื่อคอนเสิร์ต"}
                              </Title>

                              {concert.artist && (
                                <Paragraph type="secondary" ellipsis>
                                  {concert.artist}
                                </Paragraph>
                              )}

                              {concert.ShowDates && (
                                <Paragraph style={{ marginBottom: 0 }}>
                                  📅{" "}
                                  {formatDateRange(
                                    concert.ShowDates.map((sd) => sd.show_date)
                                  )}
                                </Paragraph>
                              )}
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
    </>
  );
};

export default Concert;
