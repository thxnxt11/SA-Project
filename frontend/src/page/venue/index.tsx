import React from "react";
import AdminsidebarLayout from "../../components/sidebarLayout";
import { Button, Card, Col, Input, Row, Tag, Typography } from "antd";
import {
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { FaBuilding } from "react-icons/fa6";
import { PiMicrophoneStageFill } from "react-icons/pi";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
const { Text } = Typography;
const Venue: React.FC = () => {
  const navigate = useNavigate();
  const venues = [
    {
      name: "Impact Arena",
      status: "พร้อมใช้งาน",
      statusColor: "green",
      location: "เมืองทองธานี, กรุงเทพฯ",
      capacity: "12,000 คน",
      type: "สนามกีฬา",
      stage: "1 เวที",
      stagetype: "main stage",
    },
    {
      name: "Impact Arena",
      status: "พร้อมใช้งาน",
      statusColor: "green",
      location: "เมืองทองธานี, กรุงเทพฯ",
      capacity: "12,000 คน",
      type: "สนามกีฬา",
      stage: "1 เวที",
      stagetype: "main stage",
    },
    {
      name: "Impact Arena",
      status: "พร้อมใช้งาน",
      statusColor: "green",
      location: "เมืองทองธานี, กรุงเทพฯ",
      capacity: "12,000 คน",
      type: "ฮอล์ล",
      stage: "1 เวที",
      stagetype: "main stage",
    },
    {
      name: "Impact Arena EiEi",
      status: "ไม่ว่าง",
      statusColor: "red",
      location: "เมืองทองธานี, กรุงเทพฯ",
      capacity: "12,000 คน",
      type: "ลานกิจกรรม",
      stage: "1 เวที",
      stagetype: "main stage",
    },
  ];

  return (
    <AdminsidebarLayout>
      <div style={{ padding: "20px" }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
          จัดการสถานที่และเวที
        </h1>
        <Text type="secondary">จัดการสถานที่จัดคอนเสิร์ตและเวที</Text>

        {/* Search bar */}
        <div style={{ display: "flex", margin: "15px 0" }}>
          <Input
            placeholder="ค้นหาสถานที่หรือที่ตั้ง"
            style={{ width: 400, marginRight: 10, borderRadius: 8 }}
          />
          <Button
            type="primary"
            style={{ borderRadius: 8 }}
            onClick={() => navigate("/addvenue")}
          >
            + เพิ่มสถานที่
          </Button>
        </div>

        {/* Card list */}
        <Row gutter={[16, 16]}>
          {venues.map((venue, index) => {
            return (
              <Col
                key={index}
                xs={24}
                sm={12}
                md={8}
                lg={6}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Card
                  hoverable
                  title={
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong
                        style={{
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {venue.name}
                      </strong>
                      <Tag
                        style={{
                          color: "#fff",
                          height: 20,
                          backgroundColor: venue.statusColor,
                        }}
                      >
                        {venue.status}
                      </Tag>
                    </div>
                  }
                  bordered
                  style={{
                    borderRadius: 10,
                    backgroundColor: "#fff",
                    width: "100%",
                    maxWidth: 300,
                    border: "2px solid #ccc",
                    padding: 8,
                  }}
                >
                  <p>
                    <EnvironmentOutlined /> {venue.location}
                  </p>
                  <p>
                    <TeamOutlined /> ความจุ: {venue.capacity}
                  </p>
                  <p>
                    <FaBuilding /> ประเภท: {venue.type}
                  </p>
                  <p>
                    <CalendarOutlined /> เวที: {venue.stage}
                  </p>
                  <p>
                    <PiMicrophoneStageFill /> เวทีในสถานที่:{" "}
                    <Tag>{venue.stagetype}</Tag>
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 16,
                    }}
                  >
                    <Button type="primary" icon={<FaRegEdit />}>
                      จัดการ
                    </Button>
                    <Button danger icon={<RiDeleteBin6Line />}>
                      ลบ
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </AdminsidebarLayout>
  );
};

export default Venue;
