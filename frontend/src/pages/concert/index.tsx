import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Spin, message, Button } from "antd";
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/layout/navbar";
import type { ConcertInterface } from "../../interface/concert";
import { concertAPI } from "../../services/https";

const { Title, Paragraph } = Typography;

const Concert: React.FC = () => {
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

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
        // setConcerts(data.slice(0, 6)); //แสดง concerts แบบจำกัด
        setConcerts(data);
        console.log("all Concerts: ", data);
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
      console.error("Concert ID is undefined");
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
    const ymd = s.split("T")[0] || s; // กันมีเวลา
    const [y, m, d] = ymd.split(/[-/]/).map((n) => parseInt(n, 10));
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const isConcertEnded = (showDates?: { show_date: string }[]): boolean => {
    if (!showDates || showDates.length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // เทียบเป็นรายวัน
    // จบแล้ว = ทุก show_date < วันนี้
    return showDates.every((sd) => parseLocalYMD(sd.show_date) < today);
  };

  // ฟังก์ชันเช็ควันขายบัตร
  const isOnSaleStarted = (onsaleDate?: string): boolean => {
    if (!onsaleDate) return true; // ถ้าไม่มี onsale_date ให้ถือว่าขายได้
    const now = new Date();
    const saleDateTime = new Date(onsaleDate);
    return now >= saleDateTime;
  };

  // ฟังก์ชันกำหนดสถานะปุ่มและข้อความ
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
        clickable: true, // ยังคลิกเข้าหน้า detail ได้
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
      <div style={{ padding: "20px 40px" }}>
        <Title level={2} style={{ marginBottom: 24, marginLeft: "6%" }}>
          🎶All Concerts
        </Title>

        {concerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Paragraph type="secondary">ไม่พบข้อมูลคอนเสิร์ต</Paragraph>
          </div>
        ) : (
          // คอนเทนเนอร์ “กึ่งกลางหน้า” และจำกัดความกว้าง
          <div style={{ width: "100%" }}>
            <div
              style={{
                maxWidth: 1300,
                width: "100%",
                margin: "0 auto",
                padding: "0 34px",
              }}
            >
              <Row gutter={[16, 20]} justify="start" wrap>
                {concerts.map((concert) => {
                  const buttonState = getButtonState(concert);

                  const baseBtnStyle: React.CSSProperties = {
                    height: 48,
                    fontSize: 18,
                    width: "230px",
                    borderRadius: 15,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  };
                  const grayBtnStyle: React.CSSProperties = {
                    ...baseBtnStyle,
                    backgroundColor: "#d9d9d9",
                    borderColor: "#d9d9d9",
                    color: "#fff",
                  };

                  return (
                    // ให้คอลัมน์กว้าง “คงที่” เท่ากับความกว้างการ์ด จะได้ห่อขึ้นบรรทัดใหม่พอดี
                    <Col key={concert.ID} flex="0 0 230px">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "12px",
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
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder-image.jpg";
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
                              {concert.concert_name || "ไม่ระบุชื่อคอนเสิร์ต"}
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
                                  concert.ShowDates.map((sd) => sd.show_date)
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
                            buttonState.disabled ? grayBtnStyle : baseBtnStyle
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
          </div>
        )}
      </div>
    </>
  );
};

export default Concert;
