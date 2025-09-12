/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import SidebarLayout from "../../component/layout/SidebarLayout";
import {
  Button,
  Input,
  Space,
  Table,
  Typography,
  Popconfirm,
  Modal,
  Result,
  Select,
  message,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";

import { userAPI } from "../../services/https/index";
import type { UserInterface } from "../../interface/user";

const { Text } = Typography;
const { Option } = Select;

const AllStaff: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ---------- State ----------
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [deletedUser, setDeletedUser] = useState<string | null>(null);
  const [updatedUser, setUpdatedUser] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<number | null>(null);
  const [positionFilter, setPositionFilter] = useState<number | null>(null);

  // ---------- Check location state for updated user ----------
  useEffect(() => {
    if (location.state?.updatedUserName) {
      setUpdatedUser(location.state.updatedUserName);
      // Clear state to prevent modal from showing again
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // ---------- Fetch users ----------
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRes = await userAPI.getAllStaff("?only_staff_admin=true");
      setUsers(usersRes.data);
    } catch (err) {
      console.error("❌ Error fetching staff:", err);
      message.error("Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------- Delete user ----------
  const handleDelete = async (id: number, name: string) => {
    try {
      await userAPI.deleteUser(id);
      setDeletedUser(name);
      fetchUsers(); // refresh list
    } catch (err: any) {
      console.error("❌ Error deleting user:", err);
      Modal.error({
        title: "Error",
        content: err.response?.status === 404 ? "User not found" : "Failed to delete user",
      });
    }
  };

  // ---------- Filtered users ----------
  const filteredUsers = users.filter((u) => {
    const matchesSearch = `${u.first_name} ${u.last_name}`
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesDepartment =
      !departmentFilter || u.department?.ID === departmentFilter;

    const matchesPosition =
      !positionFilter || u.position?.ID === positionFilter;

    return matchesSearch && matchesDepartment && matchesPosition;
  });

  // ---------- Table columns ----------
  const staffColumns = [
    { title: "Staff ID", dataIndex: "ID", key: "ID" },
    {
      title: "Name-Surname",
      key: "name",
      render: (_: unknown, record: UserInterface) =>
        `${record.first_name || ""} ${record.last_name || ""}`,
    },
    {
      title: "Department",
      key: "department",
      render: (_: unknown, record: UserInterface) =>
        record.department?.department || "-",
    },
    {
      title: "Position",
      key: "position",
      render: (_: unknown, record: UserInterface) =>
        record.position?.position || "-",
    },
    {
      title: "Contact number",
      key: "phone",
      render: (_: unknown, record: UserInterface) => record.phone_number || "-",
    },
    {
      title: "Email",
      key: "email",
      render: (_: unknown, record: UserInterface) => record.email || "-",
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: UserInterface) => (
        <Space>
          <Button onClick={() => navigate(`/admin/editstaff/${record.ID}`)}>
            <FaRegEdit />
          </Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() =>
              handleDelete(record.ID!, `${record.first_name} ${record.last_name}`)
            }
            okText="Yes"
            cancelText="No"
          >
            <Button danger>
              <RiDeleteBin6Line />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ---------- Unique options for filters ----------
  const uniqueDepartments = Array.from(
    new Map(users.map((u) => [u.department?.ID, u.department])).values()
  ).filter(Boolean) as any[];

  const uniquePositions = Array.from(
    new Map(users.map((u) => [u.position?.ID, u.position])).values()
  ).filter(Boolean) as any[];

  return (
    <SidebarLayout>
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: 4, fontWeight: "bold" }}>Manage Staff</h1>
        <Text type="secondary">Manage all personnel and team information</Text>

        {/* ---------- Search & Filters ---------- */}
        <div
          style={{
            marginTop: 16,
            marginBottom: 16,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Input
            placeholder="Search staff..."
            style={{ width: 200 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Select
            placeholder="Filter by Department"
            style={{ width: 180 }}
            allowClear
            value={departmentFilter ?? undefined}
            onChange={(value) => setDepartmentFilter(value ?? null)}
          >
            {uniqueDepartments.map((d) => (
              <Option key={d.ID} value={d.ID}>
                {d.department}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by Position"
            style={{ width: 180 }}
            allowClear
            value={positionFilter ?? undefined}
            onChange={(value) => setPositionFilter(value ?? null)}
          >
            {uniquePositions.map((p) => (
              <Option key={p.ID} value={p.ID}>
                {p.position}
              </Option>
            ))}
          </Select>

          <Button type="primary" onClick={() => navigate("/admin/addstaff")}>
            + Add Staff
          </Button>
        </div>

        {/* ---------- Table ---------- */}
        <Table
          columns={staffColumns}
          dataSource={filteredUsers}
          rowKey="ID"
          bordered
          loading={loading}
          pagination={{ pageSize: 20 }}
        />

        {/* ---------- Deleted user modal ---------- */}
        <Modal open={!!deletedUser} footer={null} onCancel={() => setDeletedUser(null)}>
          <Result
            status="success"
            title="Successfully Deleted User!"
            subTitle={`User "${deletedUser}" has been removed from the system.`}
            extra={[
              <Button onClick={() => setDeletedUser(null)}>Go Back</Button>,
              <Button key="add" onClick={() => navigate("/admin/addstaff")}>
                Add Another User
              </Button>,
            ]}
          />
        </Modal>

        {/* ---------- Updated user modal ---------- */}
        <Modal open={!!updatedUser} footer={null} onCancel={() => setUpdatedUser(null)}>
          <Result
            status="success"
            title="Successfully Updated User!"
            subTitle={`User "${updatedUser}" has been updated.`}
            extra={[
              <Button onClick={() => setUpdatedUser(null)}>Go Back</Button>,
              <Button key="add" onClick={() => navigate("/addstaff")}>
                Add Another User
              </Button>,
            ]}
          />
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default AllStaff;
