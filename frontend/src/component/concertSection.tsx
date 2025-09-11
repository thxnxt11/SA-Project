import React, { useMemo, useRef } from "react";
import { Row, Col, Card, Typography, Carousel, Grid, Button } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import { Link, useNavigate } from "react-router-dom";
import type { ConcertInterface } from "../interface/concert";
import ArrowButton from "../component/arrowCarouse";

const { Title, Paragraph, Text } = Typography;

type Props = {
  concerts: ConcertInterface[];
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

const ConcertSection: React.FC<Props> = ({ concerts }) => {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const concertCarouselRef = useRef<CarouselRef>(null);

  const showConcerts = useMemo(
    () => concerts.filter((c) => !isConcertEnded(c.ShowDates)),
    [concerts]
  );

  const perSlide = screens.xl ? 5 : screens.md ? 2 : 1;
  const concertslides = useMemo(() => {
    const out: ConcertInterface[][] = [];
    for (let i = 0; i < showConcerts.length; i += perSlide) {
      out.push(showConcerts.slice(i, i + perSlide));
    }
    return out;
  }, [showConcerts, perSlide]);

  const handleConcertClick = (id: number) => navigate(`/concert/${id}`);

  // HERO — แสดงเฉพาะถ้ามีคอนเสิร์ต
  const hero = showConcerts.length > 0 && (
    <div style={{ position: "relative" }}>
      <Carousel
        autoplay={{ dotDuration: true }}
        autoplaySpeed={3000}
        arrows
        infinite
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
                  backgroundPosition: "50% 60%",
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
  );

  return (
    <>
      {hero}

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
                fontSize: 18,
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
            <ArrowButton
              direction="left"
              onClick={() => concertCarouselRef.current?.prev()}
            />
            <ArrowButton
              direction="right"
              onClick={() => concertCarouselRef.current?.next()}
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
    </>
  );
};

export default ConcertSection;
