import React, { useEffect, useState } from "react";
import Navbar from "../../../component/layout/navbar";
import { Button, Card, Row, Typography, Spin, message } from "antd";
import { useAuth } from "../../../hook/authContext";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { TicketCardRow } from "./ticket";
import { eticketApi } from "../../../services/https";
import ETicketSuccess, { type Ticket as TicketModalItem } from "../show_ticket"; //

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
      <Navbar />

      {/* Header โปรไฟล์ */}
      <Row style={{ marginBottom: 16 }}>
        <Card
          style={{
            height: 200,
            width: "100%",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
          bodyStyle={{ width: "100%" }}
        >
          <Row
            align="middle"
            justify="space-between"
            style={{ width: "100%", paddingLeft: 180, paddingRight: 150 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <FaUserCircle style={{ fontSize: 80, color: "#3685edff" }} />
              <div>
                <Title level={2} style={{ margin: 3 }}>
                  {user?.name}
                </Title>
                <Text style={{ fontSize: 18, color: "#555" }}>
                  {user?.email}
                </Text>
              </div>
            </div>

            <Button
              type="primary"
              shape="round"
              size="large"
              onClick={() => navigate(`/profile/${user?.id}/edit`)}
              style={{ paddingInline: 20 }}
            >
              Edit Profile
            </Button>
          </Row>
        </Card>
      </Row>

      {/* Tickets Section */}
      <div style={{ padding: "20px 0" }}>
        {error ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Text type="danger" style={{ fontSize: 16 }}>
              {error}
            </Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => window.location.reload()}>
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
              <Button type="primary" onClick={() => navigate("/concerts")}>
                ซื้อตั๋วคอนเสิร์ต
              </Button>
            </div>
          </div>
        ) : (
          <Row gutter={[16, 20]} justify="start">
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
                    handleOpenTickets(ticket.concert_id, ticket.show_date_id);
                  }}
                />
              );
            })}
          </Row>
        )}
      </div>

      {/* 🔳 Modal แสดง E-Ticket */}
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
