import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Spin, message, Button } from "antd";
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/layout/navbar";
import type { ConcertInterface } from "../../interface/concert";

const { Title, Paragraph } = Typography;

const Concert: React.FC = () => {
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConcerts = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/concerts");
        if (!res.ok) {
          throw new Error(
            `Failed to fetch concerts: ${res.status} ${res.statusText}`
          );
        }
        const data: ConcertInterface[] = await res.json();
        console.log("Raw API response:", data);
        console.log("Concerts length:", data.length);
        setConcerts(data.slice(0, 5)); // เอาเฉพาะ 5 คอนเสิร์ตแรก
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

    // แปลงเป็น Date object และ sort
    const parsed = dates
      .map((d) => new Date(d))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (parsed.length === 0) return "ไม่ระบุวันที่";

    const first = parsed[0];
    const last = parsed[parsed.length - 1];

    // ถ้าอยู่เดือนเดียวกัน
    if (
      first.getMonth() === last.getMonth() &&
      first.getFullYear() === last.getFullYear()
    ) {
      return `${first.getDate()}–${last.getDate()} ${first.toLocaleString(
        "en-US",
        {
          month: "long",
        }
      )} ${first.getFullYear()}`;
    }

    // ถ้าข้ามเดือน/ปี → แสดงเต็มทั้งสอง
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
        <Title level={2} style={{ marginBottom: 24, marginLeft: "15%" }}>
          🎶 Recommended Concerts
        </Title>

        {concerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Paragraph type="secondary">ไม่พบข้อมูลคอนเสิร์ต</Paragraph>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Row
              gutter={[16, 20]}
              justify="center"
              style={{
                maxWidth: "1200px",
                width: "100%",
              }}
            >
              {concerts.map((concert) => (
                <Col key={concert.ID}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={concert.concert_name || "Concert"}
                          src={`http://localhost:8000${concert.concert_poster_url}`}
                          style={{
                            height: 280,
                            objectFit: "fill",
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-image.jpg";
                          }}
                        />
                      }
                      style={{
                        width: "250px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                      onClick={() => handleConcertClick(concert.ID)}
                    >
                      <Title level={5} ellipsis={{ rows: 2 }}>
                        {concert.concert_name || "ไม่ระบุชื่อคอนเสิร์ต"}
                      </Title>

                      {concert.artist && (
                        <Paragraph type="secondary" ellipsis>
                          {concert.artist} 
                        </Paragraph>
                      )}
                      {/* {getVenueName(concert.venue) && (
                        <Paragraph style={{ marginBottom: 8 }}>
                          {" "}
                          📍 {getVenueName(concert.venue)}{" "}
                        </Paragraph>
                      )} */}
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
                      onClick={() => handleConcertClick(concert.ID)}
                      type="primary"
                      size="large"
                      style={{
                        height: 48,
                        fontSize: 18,
                        width: "250px",
                        borderRadius: 15,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                      }}
                    >
                      BuyNow
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </>
  );
};

export default Concert;
