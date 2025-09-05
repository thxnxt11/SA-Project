import dayjs from "dayjs";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

type Props = {
  dateISO: string; // "2025-04-27T19:00:00+07:00"
  concertName: string; // "2025 UTO FEST GIRLS IN BANGKOK"
  venue: string; // "Queen Sirikit National Convention Center"
  posterUrl: string; // "http://localhost:8000/xxx.jpg"
  ticketCount?: number; // 1
  onClick?: () => void;
  ended?: boolean;
};

export function TicketCardRow({
  dateISO,
  concertName,
  venue,
  posterUrl,
  ticketCount = 1,
  onClick,
}: Props) {
  const d = dayjs(dateISO);
  const day = d.format("DD");
  const mon = d.format("MMM").toUpperCase();

  return (
    <Card
      // hoverable={!ended}
      onClick={onClick}
      style={{
        // position: "sticky",
        // left: 150,
        marginTop: 10,
        width: 380,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        overflow: "hidden",
        marginLeft: "70px",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div
        style={{
          display: "flex",
          gap: 0,
          alignItems: "center",
        }}
      >
        <img
          src={`http://localhost:8000${posterUrl}`}
          alt={posterUrl}
          style={{
            width: 140,
            height: 170,
            objectFit: "cover",
            borderRadius: "11px 0 0 11px", // ขอบมนเฉพาะซ้ายบนและซ้ายล่าง
            flexShrink: 0,
          }}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = "/placeholder-image.jpg";
          }}
        />

        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: 12,
            paddingLeft: 12,
          }}
        >
          {/* วันที่ */}
          <div style={{ marginBottom: 4 }}>
            <Text style={{ color: "#1890ff", fontWeight: 700 }}>
              {day} {mon}
            </Text>
          </div>

          {/* ชื่อคอนเสิร์ต */}
          <Title level={5} style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
            {concertName}
          </Title>

          <Text type="secondary" ellipsis>
            {venue}
          </Text>

          <div style={{ marginTop: 12 }}>
            <Text>
              {ticketCount} Ticket{ticketCount > 1 ? "s" : ""}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
}
