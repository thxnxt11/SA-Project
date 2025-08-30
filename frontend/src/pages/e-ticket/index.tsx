import React, { useEffect, useRef } from "react";
import { Modal, Typography, Carousel, message, Button } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import logo from "../../assets/logo.png";
import {
  CheckCircleFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";

const { Title, Text } = Typography;

export type Ticket = {
  uuid: string;
  concertName: string;
  venueName: string;
  showTimeISO: string; // ISO string
  bookingCode: string; // เช่น BK2025xxxx
  zoneType: "SEAT" | "STANDING" | string;
  zone: string; // เช่น ZONE E
  seatLabel?: string; // เช่น E10 (standing เว้นไว้)
  priceTHB: number; // 6500
  buyerName: string;
};

type Props = {
  open: boolean;
  tickets: Ticket[]; // ถ้า >1 จะใช้ Carousel
  onClose: () => void;
};

const cardWrap: React.CSSProperties = {
  width: 320,
  margin: "0 auto",
  borderRadius: 14,
  border: "10px solid #002a66",
  background: "#fff",
  boxShadow: "0 10px 20px rgba(0,0,0,.08)",
  overflow: "hidden",
};

const headerBox: React.CSSProperties = {
  padding: "12px 14px 8px",
  borderBottom: "1px solid #eaeaea",
};

const dashDivider: React.CSSProperties = {
  borderTop: "2px dashed #a7c0e8",
  margin: "0 12px",
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  marginTop: 10,
};

const footerBrand: React.CSSProperties = {
  background: "linear-gradient(0deg,#e7f0ff,#e7f0ff)",
  padding: "10px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const fontStyle = {
  fontSize: 16,
  fontWeight: "bold",
};

const TicketCard: React.FC<{ t: Ticket }> = ({ t }) => {
  const url = `${window.location.origin}/e-ticket/${t.uuid}`;

  return (
    <div style={cardWrap}>
      {/* Header */}
      <div style={headerBox}>
        <Text
          strong
          style={{ display: "block", fontSize: 18, lineHeight: 1.3 }}
        >
          {t.concertName}
        </Text>
        <Text type="secondary" style={fontStyle}>
          {t.venueName}
        </Text>
      </div>

      {/* QR Area */}
      <div style={{ padding: 14 }}>
        <div style={dashDivider} />
        <div
          style={{
            padding: "14px 0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <QRCodeCanvas value={url} size={140} />
        </div>
        <div style={dashDivider} />
        <div
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Text type="secondary" style={fontStyle}>
            Booking ID:
          </Text>
          <Text strong>{t.bookingCode}</Text>
        </div>

        <div style={dashDivider} />

        {/* Details */}
        <div style={{ paddingTop: 0 }}>
          <div style={row}>
            <div>
              <Text type="secondary" style={fontStyle}>
                Zone Type
              </Text>
              <div>
                <Text strong>{t.zoneType}</Text>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Text type="secondary" style={fontStyle}>
                Price(THB)
              </Text>
              <div>
                <Text strong>{t.priceTHB.toLocaleString()}</Text>
              </div>
            </div>
          </div>

          <div style={row}>
            <div>
              <Text type="secondary" style={fontStyle}>
                Zone
              </Text>
              <div>
                <Text strong>{t.zone}</Text>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Text type="secondary" style={fontStyle}>
                {t.zoneType.toUpperCase() === "SEAT" ? "Seat" : "Queue"}
              </Text>
              <div>
                <Text strong>{t.seatLabel ?? "-"}</Text>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <Text type="secondary" style={fontStyle}>
              Date Time
            </Text>
            <div>
              <Text strong>
                {dayjs(t.showTimeISO).format("D MMMM YYYY HH.mm")}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Footer brand */}
      <div style={footerBrand}>
        <img
          src={logo}
          alt="Eventix"
          style={{ width: 18, height: 18, objectFit: "contain" }}
        />
        <Text strong style={{ color: "#00306E" }}>
          Eventix
        </Text>
      </div>
    </div>
  );
};

const ETicketSuccess: React.FC<Props> = ({ open, tickets, onClose }) => {
  const sliderRef = useRef<CarouselRef>(null);

  useEffect(() => {
    if (open) {
      message.success({
        content: "Create E-Ticket Success",
        key: "eticket-success",
        duration: 2.5,
        icon: <CheckCircleFilled style={{ color: "#52c41a" }} />,
      });
    }
  }, [open]);

  const multiple = tickets.length > 1;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button type="primary" onClick={onClose} style={{ minWidth: 160 }}>
            Close
          </Button>
        </div>
      }
      centered
      width={560}
      closable
      maskClosable={false}
      styles={{ body: { paddingTop: 8, paddingBottom: 8 } }}
      title={
        <div style={{ textAlign: "center" }}>
          <Title level={4} style={{ margin: 0 }}>
            Your E-Ticket
          </Title>
        </div>
      }
    >
      <div style={{ padding: "8px 0 4px" }}>
        {multiple ? (
          <div style={{ width: 360, margin: "0 auto", position: "relative" }}>
            {/* Custom Navigation Buttons */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "-40px",
                transform: "translateY(-50%)",
                zIndex: 10,
              }}
            >
              <Button
                shape="circle"
                icon={<LeftOutlined />}
                onClick={() => sliderRef.current?.prev()}
                style={{
                  background: "rgba(0, 0, 0, 0.6)",
                  borderColor: "transparent",
                  color: "white",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: "-40px",
                transform: "translateY(-50%)",
                zIndex: 10,
              }}
            >
              <Button
                shape="circle"
                icon={<RightOutlined />}
                onClick={() => sliderRef.current?.next()}
                style={{
                  background: "rgba(0, 0, 0, 0.6)",
                  borderColor: "transparent",
                  color: "white",
                }}
              />
            </div>

            <Carousel
              ref={sliderRef}
              dots
              draggable
              infinite={false}
              swipeToSlide
            >
              {tickets.map((t) => (
                <div key={t.uuid}>
                  <TicketCard t={t} />
                </div>
              ))}
            </Carousel>
          </div>
        ) : (
          <TicketCard t={tickets[0]} />
        )}
      </div>
    </Modal>
  );
};

export default ETicketSuccess;
