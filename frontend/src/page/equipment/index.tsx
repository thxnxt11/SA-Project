import React, { useState } from "react";
import {
  Table,
  Button,
  Typography,
  Input,
  Select,
  Space,
  Tag,
  message,
} from "antd";
import AdminsidebarLayout from "../../components/sidebarLayout";
import AddEquipmentModal from "./addequipment/index";
import EditEquipmentModal from "./editequipment/index"; // import modal

const { Text, Title } = Typography;
const { Option } = Select;

export interface Equipment {
  id: number;
  name: string;
  equipment_type: string;
  location: string;
  stage_name: string;
  totalQuantity: number;
  remainingQuantity: number;
  usedQuantity: number;
}

const initialEquipments: Equipment[] = [
  {
    id: 1,
    name: "Meyer Sound LEO Family",
    equipment_type: "เครื่องเสียง",
    location: "Thunder Dome Arena",
    stage_name: "Main Stage Alpha",
    totalQuantity: 24,
    remainingQuantity: 10,
    usedQuantity: 14,
  },
  {
    id: 2,
    name: "LED Wall 10x6m",
    equipment_type: "จอแสดงผล",
    location: "Seaside Amphitheater",
    stage_name: "Sunset Stage",
    totalQuantity: 1,
    remainingQuantity: 0,
    usedQuantity: 1,
  },
  {
    id: 3,
    name: "Moving Head Lights",
    equipment_type: "แสงไฟ",
    location: "Royal Convention Center",
    stage_name: "Main Hall Stage",
    totalQuantity: 48,
    remainingQuantity: 20,
    usedQuantity: 28,
  },
  {
    id: 4,
    name: "Wireless Microphone Set",
    equipment_type: "เครื่องเสียง",
    location: "-",
    stage_name: "-",
    totalQuantity: 10,
    remainingQuantity: 10,
    usedQuantity: 0,
  },
];

const Equipment: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unused" | "available">(
    "all"
  );
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // ฟังก์ชันอัปเดตอุปกรณ์
  const handleUpdateEquipment = (updated: Equipment) => {
    setEquipments(
      equipments.map((eq) => (eq.id === updated.id ? updated : eq))
    );
  };
  const locations = Array.from(
    new Set(equipments.map((eq) => eq.location))
  ).filter((loc) => loc !== "-");
  const stages =
    locationFilter === "all"
      ? []
      : Array.from(
          new Set(
            equipments
              .filter((eq) => eq.location === locationFilter)
              .map((eq) => eq.stage_name)
          )
        ).filter((stage) => stage !== "-");

  const filteredEquipments = equipments.filter((eq) => {
    const matchesSearch = eq.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilterType =
      filterType === "unused"
        ? eq.usedQuantity === 0
        : filterType === "available"
        ? eq.remainingQuantity > 0
        : true;
    const matchesLocation =
      locationFilter === "all" ? true : eq.location === locationFilter;
    const matchesStage =
      stageFilter === "all" ? true : eq.stage_name === stageFilter;
    return (
      matchesSearch && matchesFilterType && matchesLocation && matchesStage
    );
  });

  const columns = [
    {
      title: "ชื่ออุปกรณ์",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Equipment) => (
        <>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary">{record.equipment_type}</Text>
        </>
      ),
    },
    {
      title:
        filterType === "available" || filterType == "unused"
          ? ""
          : "สถานที่ / เวที",
      dataIndex: "location",
      key: "location",
      render: (_: any, record: Equipment) =>
        filterType === "available" || filterType == "unused" ? null : (
          <>
            <Text>{record.location}</Text> | <Text>{record.stage_name}</Text>
          </>
        ),
    },
    {
      title: "จำนวนทั้งหมด | ใช้งาน | เหลือ",
      key: "quantity",
      render: (_: any, record: Equipment) => (
        <>
          <Text>ทั้งหมด: {record.totalQuantity}</Text> |{" "}
          <Text>ใช้งาน: {record.usedQuantity}</Text> |{" "}
          <Tag color={record.remainingQuantity === 0 ? "red" : "green"}>
            เหลือ: {record.remainingQuantity}
          </Tag>
        </>
      ),
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_: any, record: Equipment) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setEditingEquipment(record);
              setIsEditModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button type="link">Delete</Button>
        </>
      ),
    },
  ];

  const handleAddEquipment = (newEquipment: Equipment) => {
    setEquipments([...equipments, newEquipment]);
    message.success("เพิ่มอุปกรณ์เรียบร้อย");
    setIsModalOpen(false);
  };

  return (
    <AdminsidebarLayout>
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <Title level={3}>จัดการอุปกรณ์</Title>
            <Text type="secondary">จัดการอุปกรณ์เวทีและระบบต่างๆ</Text>
          </div>
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            + เพิ่มอุปกรณ์ใหม่
          </Button>
        </div>
        <Space style={{ marginBottom: 20, flexWrap: "wrap" }}>
          <Input
            placeholder="ค้นหาอุปกรณ์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Select
            value={filterType}
            onChange={(value) => setFilterType(value)}
            style={{ width: 220 }}
          >
            <Option value="all">แสดงทั้งหมด</Option>
            <Option value="unused">อุปกรณ์ที่ยังไม่ใช้ในเวทีไหน</Option>
            <Option value="available">อุปกรณ์ที่เหลือ</Option>
          </Select>

          <Select
            value={locationFilter}
            onChange={(value) => {
              setLocationFilter(value);
              setStageFilter("all");
            }}
            style={{ width: 220 }}
          >
            <Option value="all">ทุกสถานที่</Option>
            {locations.map((loc) => (
              <Option key={loc} value={loc}>
                {loc}
              </Option>
            ))}
          </Select>

          {locationFilter !== "all" && stages.length > 0 && (
            <Select
              value={stageFilter}
              onChange={(value) => setStageFilter(value)}
              style={{ width: 220 }}
            >
              <Option value="all">ทุกเวที</Option>
              {stages.map((stage) => (
                <Option key={stage} value={stage}>
                  {stage}
                </Option>
              ))}
            </Select>
          )}
        </Space>
        <Table
          dataSource={filteredEquipments}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
        <AddEquipmentModal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onAdd={handleAddEquipment}
          nextId={equipments.length + 1}
        />
        
        <EditEquipmentModal
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateEquipment}
          equipment={editingEquipment!}
        />
      </div>
    </AdminsidebarLayout>
  );
};

export default Equipment;
