import React from "react";
import { Button, Card, Col, Divider, Form, Row, Space } from "antd";
import { TbTicket } from "react-icons/tb";
import Loader from "../../component/loader/loader";

const BORDER_SOFT = "#d3d3d3ff";
const CARD_BG = "#F6F6F8";

type Props = {
  showDate?: string;
  showTime?: string;
  zoneName?: string;
  displaySeatNo: string;
  displayQuantity: number;
  unitPrice: number; // number ดิบ
  totalPriceText: string; // ข้อความที่ format แล้ว (เช่น thb.format(...))
  onCancel: () => void;
  onBooking: () => void;
  loadingBooking?: boolean;
  showFullScreenLoader?: boolean;
};

const TicketSummary: React.FC<Props> = ({
  showDate,
  showTime,
  zoneName,
  displaySeatNo,
  displayQuantity,
  unitPrice,
  totalPriceText,
  onCancel,
  onBooking,
  loadingBooking,
  showFullScreenLoader,
}) => {
  const dividerStyle: React.CSSProperties = {
    borderColor: BORDER_SOFT,
    margin: "10px 0",
  };

  return (
    <>
      <Col xs={24} style={{ marginLeft: "21px" }}>
        <Card
          style={{
            width: 1200,
            marginTop: "24px",
            borderColor: BORDER_SOFT,
            backgroundColor: CARD_BG,
            borderRadius: 15,
            padding: "15px",
            textAlign: "left",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          <h1
            style={{
              position: "absolute",
              top: 15,
              margin: 0,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <TbTicket style={{ fontSize: "130%" }} />
            Ticket Information
          </h1>
          <Divider
            style={{
              borderColor: BORDER_SOFT,
              marginTop: 40,
              marginBottom: 10,
            }}
          />

          <Row gutter={[0, 3]} style={{ fontSize: 24 }} align="middle">
            <Col span={12} style={{ fontSize: 18 }}>
              ShowDate:
            </Col>
            <Col span={12} style={{ fontSize: 18 }}>
              <strong>{showDate}</strong>
            </Col>
            <Divider style={dividerStyle} />

            <Col span={12} style={{ fontSize: 18 }}>
              ShowTime:
            </Col>
            <Col span={12} style={{ fontSize: 18 }}>
              <strong>{showTime}</strong>
            </Col>
            <Divider style={dividerStyle} />

            <Col span={12} style={{ fontSize: 18 }}>
              Zone:
            </Col>
            <Col span={12} style={{ fontSize: 18 }}>
              <strong>{zoneName}</strong>
            </Col>
            <Divider style={dividerStyle} />

            <Col span={12} style={{ fontSize: 18 }}>
              Seat No:
            </Col>
            <Col span={12} style={{ fontSize: 18 }}>
              <strong>{displaySeatNo}</strong>
            </Col>
            <Divider style={dividerStyle} />

            <Col span={12} style={{ fontSize: 18 }}>
              Quantity:
            </Col>
            <Col span={12} style={{ fontSize: 18 }}>
              <strong>{displayQuantity}</strong>
            </Col>
            <Divider style={dividerStyle} />

            <Col span={12} style={{ fontSize: 18 }}>
              Unit Price (THB):
            </Col>
            <Col span={12} style={{ fontSize: 18 }}>
              <strong>฿ {unitPrice}</strong>
            </Col>
            <Divider style={dividerStyle} />

            <Col span={12} style={{ fontSize: 18 }}>
              Total Price (THB):
            </Col>
            <Col span={12} style={{ fontSize: 18 }}>
              <strong>฿ {totalPriceText}</strong>
            </Col>
            <Divider style={dividerStyle} />
          </Row>
        </Card>
      </Col>

      <Row style={{ display: "flex", justifyContent: "center", marginTop: 30 }}>
        <Form.Item>
          <Space size={30}>
            <Button
              onClick={onCancel}
              type="default"
              size="large"
              style={{
                height: 48,
                fontSize: 20,
                padding: "0 24px",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              onClick={onBooking}
              loading={loadingBooking}
              size="large"
              style={{
                height: 48,
                fontSize: 20,
                padding: "0 24px",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              Booking
            </Button>
            {showFullScreenLoader && <Loader />}
          </Space>
        </Form.Item>
      </Row>
    </>
  );
};

export default TicketSummary;
