import React from "react";
import { Card, Row, Col, Typography, Tag, Space, Button, Input } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import AdminsidebarLayout from "../../components/sidebarLayout";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface Event {
  name: string;
  status: "กำลังดำเนินการ" | "กำลังวางแผน";
  date: string;
  location: string;
  description: string;
  participants: number;
  statusColor: string;
}

const events: Event[] = [
  {
    name: "Concert A",
    status: "กำลังดำเนินการ",
    statusColor: "processing",
    date: "15/3/2567",
    location: "Impact Arena",
    description: "คอนเสิร์ตเพลงป๊อปของศิลปินชื่อดัง",
    participants: 5000,
  },
  {
    name: "Music Festival 2024",
    status: "กำลังวางแผน",
    statusColor: "warning",
    date: "16/3/2567 - 17/3/2567",
    location: "Outdoor Area",
    description: "เทศกาลดนตรีกลางแจ้ง 2 วัน 2 คืน",
    participants: 15000,
  },
];

const WorkSchedlue: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AdminsidebarLayout>
      <div style={{ padding: "20px" }}>
        <Row align="middle" style={{ marginBottom: 16 }}>
          <Col flex="1">
            <div style={{ marginBottom: 8 }}>
              <h1 style={{ fontWeight: "bold", marginBottom: 4 }}>ตารางงาน</h1>
              <Text type="secondary">สร้างตารางงานและจัดการอีเวนต์ต่างๆ</Text>
            </div>
            <div style={{ display: "flex", gap: 8 , width: 500, marginRight: 10, borderRadius: 8}}>
              <Input
                placeholder="ค้นหางานคอนเสิร์ต"
                style={{ borderRadius: 8 }}
              />
              <Button
                type="primary"
                onClick={() => navigate("/time_schedule")}
                style={{ borderRadius: 8 }}
              >
                + เพิ่มตารางงาน
              </Button>
            </div>
          </Col>
        </Row>

        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {events.map((event, index) => (
            <Card
              key={index}
              style={{
                borderLeft: `5px solid ${
                  event.statusColor === "processing"
                    ? "#1677ff"
                    : event.statusColor === "warning"
                    ? "#faad14"
                    : "#ccc"
                }`,
                borderRadius: 12,
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Row justify="space-between" align="middle">
                <Col>
                  <Space direction="vertical" size={4}>
                    <Space>
                      <Title level={5} style={{ margin: 0 }}>
                        {event.name}
                      </Title>
                      <Tag color={event.statusColor}>{event.status}</Tag>
                    </Space>

                    <Space>
                      <CalendarOutlined />
                      <Text>{event.date}</Text>

                      <EnvironmentOutlined style={{ marginLeft: 16 }} />
                      <Text>{event.location}</Text>

                      <UserOutlined style={{ marginLeft: 16 }} />
                      <Text>{event.participants.toLocaleString()} คน</Text>
                    </Space>

                    <Text type="secondary">{event.description}</Text>

                    <Space>
                      <Button>ดูตารางงาน</Button>
                      <Button>จัดการทีมงาน</Button>
                    </Space>
                  </Space>
                </Col>

                <Col>
                  <Space>
                    <Button icon={<EditOutlined />} />
                    <Button icon={<DeleteOutlined />} danger />
                  </Space>
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      </div>
    </AdminsidebarLayout>
  );
};
export default WorkSchedlue;
