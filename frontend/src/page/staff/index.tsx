import React from "react";
import AdminsidebarLayout from "../../components/sidebarLayout";
import { Button, Input, Space, Table, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
const staffData = [
  {
    key: "1",
    id: "B6612726",
    name: "สมชาย ใจดี",
    department: "รักษาความปลอดภัย",
    position: "หัวหน้าความปลอดภัย",
    phone: "097-317-3359",
    status: "พร้อมทำงาน",
  },
  {
    key: "2",
    id: "B6682930",
    name: "สมหญิง ใจร้าย",
    department: "เวที",
    position: "หัวหน้าเวที",
    phone: "097-317-3359",
    status: "ลาป่วย",
  },
];

const staffColumns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "แผนก",
    dataIndex: "department",
    key: "department",
  },
  {
    title: "ตำแหน่ง",
    dataIndex: "position",
    key: "position",
  },
  {
    title: "เบอร์ติดต่อ",
    dataIndex: "phone",
    key: "phone",
  },
  {
    title: "สถานะ",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <Tag color={status === "พร้อมทำงาน" ? "green" : "orange"}>{status}</Tag>
    ),
  },
  {
    title: "",
    key: "action",
    _render: () => {
      return (
        <Space>
          <Button>
            <FaRegEdit />
          </Button>
          <Button danger>
            <RiDeleteBin6Line />
          </Button>
        </Space>
      );
    },
    get render() {
      return this._render;
    },
    set render(value) {
      this._render = value;
    },
  },
];
const { Text } = Typography;
const Staff: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <AdminsidebarLayout>
        <div style={{ padding: "20px" }}>
          <h1 style={{ fontSize: 28, fontWeight: "bold" }}>จัดการทีมงาน</h1>
          <Text type="secondary">จัดการข้อมูลบุคลากรและทีมงานทั้งหมด</Text>
          <div>
            <Input
              placeholder="ค้นหารายชื่อทีมงาน"
              style={{ width: 400, borderRadius: 8 }}
            ></Input>
            <Button
              type="primary"
              style={{ margin: 8, borderRadius: 8 }}
              onClick={() => navigate("/addstaff")}
            >
              + เพิ่มทีมงาน
            </Button>
          </div>

          <Table
            columns={staffColumns}
            dataSource={staffData}
            bordered
            pagination={{ pageSize: 5 }}
          />
        </div>
      </AdminsidebarLayout>
    </>
  );
};

export default Staff;
