import React, { useState } from "react";
import { Card, Row, Col, Button, Typography, Input, Select, Tag, Space } from "antd";
import { SettingOutlined, FilterOutlined } from "@ant-design/icons";
import AdminsidebarLayout from "../../components/sidebarLayout";
const { Text, Title } = Typography;
const { Option } = Select;

interface Equipment {
  id: number;
  name: string;
  equipment_type: string;
  location: string;
  stage_name: string;
  quantity: number;
  lastMaintenance: string;
  equipment_status: "available" | "repair" | "lost";
}

const equipments: Equipment[] = [
  {
    id: 1,
    name: "Meyer Sound LEO Family",
    equipment_type: "เครื่องเสียง",
    location: "Thunder Dome Arena",
    stage_name: "Main Stage Alpha",
    quantity: 24,
    lastMaintenance: "15/1/2567",
    equipment_status: "available",
  },
  {
    id: 2,
    name: "LED Wall 10x6m",
    equipment_type: "จอแสดงผล",
    location: "Seaside Amphitheater",
    stage_name: "Sunset Stage",
    quantity: 1,
    lastMaintenance: "10/1/2567",
    equipment_status: "repair",
  },
  {
    id: 3,
    name: "Moving Head Lights",
    equipment_type: "แสงไฟ",
    location: "Royal Convention Center",
    stage_name: "Main Hall Stage",
    quantity: 48,
    lastMaintenance: "20/1/2567",
    equipment_status: "available",
  },
];

const statusColors = {
  available: "green",
  repair: "orange",
  lost: "red",
};

const Equipment: React.FC = () => {
  const [search, setSearch] = useState("");

  return (
  <AdminsidebarLayout>
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <Title level={3}>จัดการอุปกรณ์</Title>
          <Text type="secondary">จัดการอุปกรณ์เวทีและระบบต่างๆ</Text>
        </div>
        <Button type="primary">+ เพิ่มอุปกรณ์ใหม่</Button>
      </div>

      {/* Summary */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Text>อุปกรณ์ทั้งหมด</Text>
            <Title level={3}>5</Title>
            <SettingOutlined style={{ fontSize: 20 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text>พร้อมใช้งาน</Text>
            <Title level={3}>3</Title>
            <SettingOutlined style={{ fontSize: 20, color: "green" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text>ซ่อมบำรุง</Text>
            <Title level={3}>1</Title>
            <SettingOutlined style={{ fontSize: 20, color: "orange" }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text>เสียหาย</Text>
            <Title level={3}>1</Title>
            <SettingOutlined style={{ fontSize: 20, color: "red" }} />
          </Card>
        </Col>
      </Row>

      {/* Search & Filter */}
      <Space style={{ marginBottom: 20 }}>
        <Input
          placeholder="ค้นหาอุปกรณ์..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select placeholder="ทุกประเภท" style={{ width: 150 }}>
          <Option value="all">ทุกประเภท</Option>
          <Option value="sound">เครื่องเสียง</Option>
          <Option value="light">แสงไฟ</Option>
          <Option value="display">จอแสดงผล</Option>
        </Select>
        <Select placeholder="ทุกสถานะ" style={{ width: 150 }}>
          <Option value="all">ทุกสถานะ</Option>
          <Option value="available">พร้อมใช้งาน</Option>
          <Option value="repair">ซ่อมบำรุง</Option>
          <Option value="lost">เสียหาย</Option>
        </Select>
        <Button icon={<FilterOutlined />}>ตัวกรองเพิ่มเติม</Button>
      </Space>

      {/* Equipment Grid */}
      <Row gutter={[16, 16]}>
        {equipments
          .filter((eq) => eq.name.toLowerCase().includes(search.toLowerCase()))
          .map((eq) => (
            <Col span={8} key={eq.id}>
              <Card
                title={eq.name}
                extra={<Tag color={statusColors[eq.equipment_status]}>{eq.equipment_status === "available" ? "พร้อมใช้งาน" : eq.equipment_status === "repair" ? "ซ่อมบำรุง" : "เสียหาย"}</Tag>}
                actions={[
                  <Button type="link">ดูรายละเอียด</Button>,
                  <Button type="link">แก้ไข</Button>,
                ]}
              >
                <Text type="secondary">{eq.equipment_type}</Text>
                <div style={{ marginTop: 10 }}>
                  <Text>สถานที่: {eq.location}</Text>
                  <br />
                  <Text>เวที: {eq.stage_name}</Text>
                  <br />
                  <Text>จำนวน: {eq.quantity} ชิ้น</Text>
                  <br />
                  <Text>บำรุงล่าสุด: {eq.lastMaintenance}</Text>
                </div>
              </Card>
            </Col>
          ))}
      </Row>
    </div>
  </AdminsidebarLayout>
  );
};

export default Equipment;
