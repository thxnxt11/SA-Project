import { useState } from "react";
import { Button, Input, Table, Space, Typography, Tag, Avatar } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import React from "react";
import AddTaskAssignment from "./addassignment";
import AdminsidebarLayout from "../../components/sidebarLayout";

const { Text } = Typography;

interface Assignment {
  id: number;
  taskTitle: string;
  description: string;
  assignedTo: number[];
  assignedStaffNames: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: "pending" | "in-progress" | "completed";
  category: string;
  concert: string;
}

const getStatusTag = (status: string) => {
  switch (status) {
    case "pending":
      return <Tag color="default">รอดำเนินการ</Tag>;
    case "in-progress":
      return <Tag color="processing">กำลังทำ</Tag>;
    case "completed":
      return <Tag color="success">เสร็จแล้ว</Tag>;
    default:
      return <Tag color="default">{status}</Tag>;
  }
};

const columns = [
  {
    title: "งาน",
    key: "task",
    render: (record: Assignment) => (
      <Space direction="vertical" size="small">
        <Text strong>{record.taskTitle}</Text>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {record.description}
        </Text>
        <Space wrap>
          <Tag color="blue">{record.category}</Tag>
        </Space>
      </Space>
    ),
  },
  {
    title: "คอนเสิร์ต",
    dataIndex: "concert",
  },
  {
    title: "ผู้รับผิดชอบ",
    dataIndex: "assignedStaffNames",
    key: "assignedStaffNames",
    render: (names: string[]) => (
      <Space direction="vertical" size="small">
        {names.map((name, index) => (
          <Space key={index}>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text style={{ fontSize: "12px" }}>{name}</Text>
          </Space>
        ))}
      </Space>
    ),
  },
  {
    title: "วันที่และเวลา",
    key: "datetime",
    render: (record: Assignment) => (
      <Space direction="vertical" size="small">
        <Space>
          <CalendarOutlined />
          <Text style={{ fontSize: "12px" }}>
            {record.startDate}
            {record.startDate !== record.endDate && ` - ${record.endDate}`}
          </Text>
        </Space>
        <Space>
          <ClockCircleOutlined />
          <Text style={{ fontSize: "12px" }}>
            {record.startTime} - {record.endTime}
          </Text>
        </Space>
      </Space>
    ),
  },

  {
    title: "สถานะ",
    dataIndex: "status",
    key: "status",
    render: (status: string) => getStatusTag(status),
  },
  {
    title: "การจัดการ",
    key: "actions",
    render: () => (
      <Space>
        <Button type="text" icon={<EditOutlined />} />
        <Button type="text" danger icon={<DeleteOutlined />} />
      </Space>
    ),
  },
];
const mockAssignments: Assignment[] = [
  {
    id: 1,
    taskTitle: "ติดตั้งระบบเสียงหลัก",
    description: "ติดตั้งและทดสอบระบบเสียงสำหรับเวทีหลัก",
    assignedTo: [1, 2],
    assignedStaffNames: ["อนุชา สุขใส", "สมชาย กิจดี"],
    startDate: "2024-12-25",
    endDate: "2024-12-25",
    startTime: "08:00",
    endTime: "12:00",
    status: "pending",
    category: "เสียง",
    concert: "คอนเสิร์ตเชียงใหญ่เฟส",
  },
  {
    id: 2,
    taskTitle: "จัดแสงเวที",
    description: "ติดตั้งและปรับแสงเวทีหลัก",
    assignedTo: [3, 4],
    assignedStaffNames: ["วิชัย มั่นคง", "ประยุทธ์ จริงใจ"],
    startDate: "2024-12-25",
    endDate: "2024-12-25",
    startTime: "10:00",
    endTime: "14:00",
    status: "in-progress",
    category: "แสง",
    concert: "BNK 48",
  },
  {
    id: 3,
    taskTitle: "เตรียมเวที",
    description: "จัดเตรียมเวทีและอุปกรณ์",
    assignedTo: [5],
    assignedStaffNames: ["สุรชัย ลาภดี", "วชิรา ลงกรณ์"],
    startDate: "2024-12-25",
    endDate: "2024-12-25",
    startTime: "06:00",
    endTime: "10:00",
    status: "completed",
    category: "เวที",
    concert: "คอนเสิร์ต PUN",
  },
];

const TaskAssignment: React.FC = () => {
  const [assignments] = useState<Assignment[]>(mockAssignments);
  const [searchTerm] = useState("");
  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [visible, setVisible] = useState(false);
  return (
    <AdminsidebarLayout>
      <div style={{ padding: "20px" }}>
        <Space>
          <div>
            <h1 style={{ fontWeight: "Bold" }}>มอบหมายงาน</h1>
            <p>จัดการและมอบหมายงานให้กับทีมงาน</p>
            <Input
              placeholder="ค้นหางานที่มอบหมาย"
              style={{ width: 400, marginRight: 10, borderRadius: 8 }}
            />
            <Button type="primary" onClick={() => setVisible(true)}>
              + มอบหมายงานใหม่
            </Button>
            <AddTaskAssignment
              visible={visible}
              onCancel={() => setVisible(false)}
            />
          </div>
        </Space>

        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Table
            bordered
            columns={columns}
            dataSource={filteredAssignments}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </div>
    </AdminsidebarLayout>
  );
};

export default TaskAssignment;
