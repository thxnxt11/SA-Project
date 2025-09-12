/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Typography,
  Input,
  Select,
  Space,
  Tag,
  message,
  Spin,
  Tooltip,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import SidebarLayout from "../../component/layout/SidebarLayout";
import AddEquipmentModal from "./addequipment";
import EditEquipmentModal from "./editequipment";
import { equipmentAPI } from "../../services/https/index";
import type { EquipmentInterface } from "../../interface/equipment";


const { Text, Title } = Typography;
const { Option } = Select;

const Equipment: React.FC = () => {
  const [equipments, setEquipments] = useState<EquipmentInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentInterface | null>(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unused" | "available">("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ---------------- Fetch Equipments ----------------
  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const res = await equipmentAPI.getAllEquipments();
      setEquipments(res.data || []);
    } catch (err) {
      message.error("โหลดข้อมูลอุปกรณ์ล้มเหลว");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  // ---------------- Add / Update ----------------
  const handleAddEquipment = async (newEquipment: EquipmentInterface) => {
    setEquipments([...equipments, newEquipment]);
    message.success("เพิ่มอุปกรณ์เรียบร้อย");
    setIsAddModalOpen(false);
  };

  const handleUpdateEquipment = (updated: EquipmentInterface) => {
    setEquipments(equipments.map((eq) => (eq.ID === updated.ID ? updated : eq)));
    message.success("แก้ไขอุปกรณ์เรียบร้อย");
    setIsEditModalOpen(false);
  };

  // ---------------- Delete Equipment ----------------
  const handleDeleteEquipment = async (id: number) => {
    try {
      setLoading(true);
      const res = await equipmentAPI.delete(id);
      if (res?.status === 200 || res?.status === 204) {
        await fetchEquipments();
        message.success("ลบอุปกรณ์เรียบร้อยแล้ว");
      } else {
        message.error("ลบอุปกรณ์ไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      message.error("ลบอุปกรณ์ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Filters ----------------
  const locations = Array.from(
    new Set(
      equipments.flatMap(
        (eq) =>
          eq.stage_equipments?.map((se) => se.stage?.venue?.venue_name).filter(Boolean) || []
      )
    )
  );

  const stages =
    locationFilter === "all"
      ? []
      : Array.from(
          new Set(
            equipments.flatMap(
              (eq) =>
                eq.stage_equipments
                  ?.filter((se) => se.stage?.venue?.venue_name === locationFilter)
                  .map((se) => se.stage?.stage_name)
                  .filter(Boolean) || []
            )
          )
        );

  const filteredEquipments = equipments.filter((eq) => {
    const matchesSearch = eq.equipment_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilterType =
      filterType === "unused"
        ? (eq.used_quantity || 0) === 0
        : filterType === "available"
        ? (eq.remaining_quantity || 0) > 0
        : true;
    const matchesLocation =
      locationFilter === "all"
        ? true
        : eq.stage_equipments?.some((se) => se.stage?.venue?.venue_name === locationFilter);
    const matchesStage =
      stageFilter === "all"
        ? true
        : eq.stage_equipments?.some((se) => se.stage?.stage_name === stageFilter);
    return matchesSearch && matchesFilterType && matchesLocation && matchesStage;
  });

  // ---------------- Columns ----------------
  const columns = [
    {
      title: "ชื่ออุปกรณ์",
      dataIndex: "equipment_name",
      key: "equipment_name",
      render: (text: string, record: EquipmentInterface) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary">{record.equipment_type?.equipment_type || "-"}</Text>
        </div>
      ),
    },
    {
      title: filterType === "available" || filterType === "unused" ? "" : "สถานที่ / เวที",
      key: "location",
      render: (_: any, record: EquipmentInterface) => {
        if (filterType === "available" || filterType === "unused") return null;
        if (!record.stage_equipments || record.stage_equipments.length === 0) return null;

        const validStageEquipments = record.stage_equipments.filter((se) => se.stage && se.stage.venue);
        if (validStageEquipments.length === 0) return null;

        const uniqueStageEquipments = Array.from(
          new Set(
            validStageEquipments.map(
              (se) => `${se.stage.venue?.venue_name}|${se.stage.stage_name}|${se.stage_quantity}`
            )
          )
        ).map((key) => {
          const [venueName, stageName, quantity] = key.split("|");
          return { venueName, stageName, quantity };
        });

        return uniqueStageEquipments.map((se, idx) => (
          <div key={idx}>
            <Text>{se.venueName}</Text> | <Text>{se.stageName}</Text> | <Text>จำนวน: {se.quantity}</Text>
          </div>
        ));
      },
    },
    {
      title: "จำนวนทั้งหมด | เหลือ",
      key: "quantity",
      render: (_: any, record: EquipmentInterface) => (
        <div>
          <Text>ทั้งหมด: {record.total_quantity || 0}</Text> |{" "}
          <Tag color={record.remaining_quantity === 0 ? "red" : "green"}>
            เหลือ: {record.remaining_quantity || 0}
          </Tag>
        </div>
      ),
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_: any, record: EquipmentInterface) => (
        <Space>
          <Tooltip title="แก้ไขอุปกรณ์">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingEquipment(record);
                setIsEditModalOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="ลบอุปกรณ์">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteEquipment(Number(record.ID))}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <SidebarLayout>
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <Title level={3}>จัดการอุปกรณ์</Title>
            <Text type="secondary">จัดการอุปกรณ์เวทีและระบบต่างๆ</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
            เพิ่มอุปกรณ์ใหม่
          </Button>
        </div>

        <Space style={{ marginBottom: 20, flexWrap: "wrap" }}>
          <Input
            placeholder="ค้นหาอุปกรณ์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />

          <Select value={filterType} onChange={(value) => setFilterType(value)} style={{ width: 220 }}>
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
            <Select value={stageFilter} onChange={(value) => setStageFilter(value)} style={{ width: 220 }}>
              <Option value="all">ทุกเวที</Option>
              {stages.map((stage) => (
                <Option key={stage} value={stage}>
                  {stage}
                </Option>
              ))}
            </Select>
          )}
        </Space>

        {loading ? (
          <Spin />
        ) : (
          <Table
            dataSource={filteredEquipments}
            columns={columns}
            rowKey={(record) => record.ID || record.equipment_name}
            pagination={{ pageSize: 5 }}
          />
        )}

        <AddEquipmentModal
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          onAdd={handleAddEquipment}
        />

        {editingEquipment && (
          <EditEquipmentModal
            open={isEditModalOpen}
            onCancel={() => setIsEditModalOpen(false)}
            onSave={handleUpdateEquipment}
            equipmentId={Number(editingEquipment.ID)}
          />
        )}
      </div>
    </SidebarLayout>
  );
};

export default Equipment;
