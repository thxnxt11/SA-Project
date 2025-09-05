import React, { useEffect, useState } from "react";
import Navbar from "../../../component/layout/navbar";
import {
  Button,
  Card,
  Row,
  Typography,
  Spin,
  message,
  Col,
  Space,
  Avatar,
} from "antd";
import { useAuth } from "../../../hook/authContext";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TicketCardRow } from "./ticket";
import { eticketApi } from "../../../services/https";
import ETicketSuccess, { type Ticket as TicketModalItem } from "../show_ticket";
import { LuTicket } from "react-icons/lu";

const { Title, Text } = Typography;

interface MyEticketInfo {
  concert_id: number;
  show_date_id: number;
  date_iso: string;
  title: string;
  venue: string;
  concert_poster_url: string;
  ticket_count: number;
}

const MyETicket: React.FC = () => {
  const { user } = useAuth();
  const [etickets, setEtickets] = useState<MyEticketInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Modal state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketsForModal, setTicketsForModal] = useState<TicketModalItem[]>([]);

  useEffect(() => {
    const fetchETickets = async (): Promise<void> => {
      try {
        if (!user) {
          setError("กรุณาเข้าสู่ระบบก่อน");
          return;
        }
        if (!user.id) {
          setError("ไม่พบข้อมูล User ID");
          return;
        }

        setLoading(true);
        setError(null);

        const res = await eticketApi.getByUserId(user.id);
        const payload = res?.data;

        const list: MyEticketInfo[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        setEtickets(list);
      } catch (err: any) {
        console.error("Error fetching e-tickets:", err);
        setError("ไม่สามารถโหลดข้อมูลตั๋วได้");
        message.error("ไม่สามารถโหลดตั๋วของคุณได้");
        setEtickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchETickets();
  }, [user]);

  const isConcertEnded = (dateISO: string): boolean => {
    const t = Date.parse(dateISO);
    if (Number.isNaN(t)) return false;
    return new Date(t) < new Date();
  };

  const handleOpenTickets = async (concertId: number, showDateId: number) => {
    try {
      if (!user?.id) return;
      const res = await eticketApi.getByShowId(user.id, concertId, showDateId);
      const payload = res?.data;

      const rawList: any[] = payload?.data?.tickets ?? [];

      const mapped: TicketModalItem[] = rawList.map((it) => {
        const ref = it.uuid ?? it.booking_code ?? "";
        return {
          uuid: ref,
          concertName: it.concert_name,
          venueName: it.venue_name,
          showTimeISO: it.show_time_iso,
          bookingCode: it.booking_code ?? "",
          zoneType: it.zone_type,
          zone: it.zone,
          seatLabel: it.seat_label ?? undefined,
          queueNumber:
            typeof it.queue_number === "number" ? it.queue_number : undefined,
          priceTHB: it.price ?? 0,
        };
      });

      setTicketsForModal(mapped);
      setShowTicketModal(true);
    } catch (e) {
      console.error(e);
      message.error("ไม่สามารถเปิดตั๋วชุดนี้ได้");
    }
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          paddingBottom: 40,
        }}
      >
        <Navbar />

        {/* Header โปรไฟล์ */}
        <Row justify="center" style={{ marginTop: 20 }}>
          <Col xs={24} sm={22} md={20} lg={18} xl={16}>
            <Card
              style={{
                borderRadius: 20,
                background:
                  "linear-gradient(135deg, #001a4d 0%, #00306e 50%, #004a8f 100%)",
                border: "none",
                boxShadow:
                  "0 20px 60px rgba(0, 26, 77, 0.3), 0 8px 32px rgba(0, 26, 77, 0.2)",
                overflow: "hidden",
                position: "relative",
              }}
              bodyStyle={{ padding: 0 }}
            >
              {/* Decorative background elements */}
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.05)",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.03)",
                  zIndex: 1,
                }}
              />

              <div
                style={{
                  padding: "48px 40px",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <Row align="middle" justify="space-between">
                  <Col>
                    <Space size={24} align="center">
                      <Avatar
                        size={80}
                        icon={<UserOutlined />}
                        style={{
                          background: "rgba(255, 255, 255, 0.15)",
                          color: "white",
                          fontSize: 32,
                          border: "3px solid rgba(255, 255, 255, 0.2)",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                        }}
                      />
                      <div>
                        <Title
                          level={2}
                          style={{
                            margin: 0,
                            color: "white",
                            fontSize: 28,
                            fontWeight: 700,
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                          }}
                        >
                          {user?.name || "User"}
                        </Title>
                        <Text
                          style={{
                            fontSize: 16,
                            color: "rgba(255, 255, 255, 0.8)",
                            fontWeight: 500,
                          }}
                        >
                          {user?.email || "user@example.com"}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      size="large"
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/user/profile`)}
                      style={{
                        borderRadius: 12,
                        height: 48,
                        paddingInline: 24,
                        background: "rgba(255, 255, 255, 0.15)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        fontWeight: 600,
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.25)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 24px rgba(0, 0, 0, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.15)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 16px rgba(0, 0, 0, 0.2)";
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Content Container */}
        <div style={{ padding: "40px 24px" }}>
          <Row justify="center">
            <Col xs={24} sm={22} md={20} lg={18} xl={16}>
              {/* Section Header */}
              <div style={{ marginBottom: 32 }}>
                <Space align="center" size={16}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg, #001a4d 0%, #004a8f 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 24px rgba(0, 26, 77, 0.3)",
                    }}
                  >
                    <LuTicket style={{ fontSize: 24, color: "white" }} />
                  </div>
                  <div>
                    <Title
                      level={2}
                      style={{
                        margin: 0,
                        background:
                          "linear-gradient(135deg, #001a4d 0%, #004a8f 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontSize: 32,
                        fontWeight: 700,
                      }}
                    >
                      My E-Tickets
                    </Title>
                    <Text style={{ fontSize: 16, color: "#64748b" }}>
                      Manage and view your concert tickets
                    </Text>
                  </div>
                </Space>
              </div>

              {/* Tickets Section */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                {error ? (
                  <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <Text type="danger" style={{ fontSize: 16 }}>
                      {error}
                    </Text>
                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        onClick={() => window.location.reload()}
                      >
                        ลองใหม่
                      </Button>
                    </div>
                  </div>
                ) : loading ? (
                  <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                      <Text>กำลังโหลดตั๋วของคุณ...</Text>
                    </div>
                  </div>
                ) : etickets.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      คุณยังไม่มีตั๋วในระบบ
                    </Text>
                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        onClick={() => navigate("/Eventix")}
                      >
                        ซื้อตั๋วคอนเสิร์ต
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Row
                    gutter={[16, 0]}
                    justify="start"
                    style={{ marginLeft: -40 }}
                  >
                    {etickets.map((ticket, index) => {
                      const ended = isConcertEnded(ticket.date_iso);
                      return (
                        <TicketCardRow
                          key={`${ticket.concert_id}-${ticket.show_date_id}-${index}`}
                          dateISO={ticket.date_iso}
                          concertName={ticket.title}
                          venue={ticket.venue}
                          posterUrl={ticket.concert_poster_url}
                          ticketCount={ticket.ticket_count}
                          ended={ended}
                          onClick={() => {
                            // เปิดเป็นโมดัล eticket success แทนการ navigate
                            handleOpenTickets(
                              ticket.concert_id,
                              ticket.show_date_id
                            );
                          }}
                        />
                      );
                    })}
                  </Row>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Modal แสดง E-Ticket */}
      <ETicketSuccess
        open={showTicketModal}
        tickets={ticketsForModal}
        onClose={() => setShowTicketModal(false)}
        suppressToast
      />
    </>
  );
};

export default MyETicket;
