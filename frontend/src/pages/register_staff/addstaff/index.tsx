/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import SidebarLayout from "../../../component/layout/SidebarLayout";
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Select,
  Card,
  DatePicker,
  message,
  Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../../services/https/index";
import type { GenderInterface } from "../../../interface/gender";
import type {
  CreateUserInterface,
  DepartmentInterface,
  PositionInterface,
  RoleInterface,
} from "../../../interface/user";

const { Option } = Select;

const AddStaff: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // ---------- State ----------
  const [genders, setGenders] = useState<GenderInterface[]>([]);
  const [roles, setRoles] = useState<RoleInterface[]>([]);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [positions, setPositions] = useState<PositionInterface[]>([]);
  const [modalPassword, setModalPassword] = useState<string | null>(null);

  // ---------- Load dropdowns ----------
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const data = await userAPI.getDropdowns();
        setGenders(data.genders);
        setRoles(data.roles);
        setDepartments(data.departments);
        setPositions(data.positions);
      } catch (error) {
        console.error(error);
        message.error("❌ Failed to load dropdowns");
      }
    };
    fetchDropdowns();
  }, []);

  // ---------- Handle form submit ----------
  const handleSubmit = async (values: any) => {
    // Validate and format the input values ที่ backend ต้องการ
    console.log("Form values:", values);
    try {
      const payload: CreateUserInterface = {
        first_name: values.firstName,
        last_name: values.lastName,
        birthday: values.birthday.format("YYYY-MM-DD"),
        gender_id: Number(values.gender_id),
        email: values.email,
        phone_number: values.phone_number || "",
        role_id: Number(values.role_id),
        department_id: Number(values.department_id),
        position_id: Number(values.position_id),
        address: values.address,
      };

      console.log("Payload to send:", payload);

      const res = await userAPI.createUser(payload);

      if (res.status === 201) {
        const defaultPassword = res.data.default_pass;
        setModalPassword(defaultPassword);
        form.resetFields();
      } else {
        message.error(res.data?.error || "❌ Failed to save staff");
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.error || "❌ Failed to save staff");
    }
  };

  return (
    <SidebarLayout>
      <div style={{ padding: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          เพิ่มข้อมูลทีมงาน
        </h1>

        <Card bordered style={{ borderRadius: 8 }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter first name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter last name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Birthday"
                  name="birthday"
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea placeholder="Enter address" autoSize />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Gender"
                  name="gender_id"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select gender" >
                    {genders.map((g: GenderInterface) => (
                      <Option key={g.id} value={g.id}>
                        {g.gender}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ type: "email", required: true }]}
                >
                  <Input placeholder="Enter email" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Phone" name="phone_number">
                  <Input placeholder="Enter phone" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Role"
                  name="role_id"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select role">
                    {roles.map((r: RoleInterface) => (
                      <Option key={r.ID} value={r.ID}>
                        {r.role}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Department"
                  name="department_id"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select department">
                    {departments.map((d: DepartmentInterface) => (
                      <Option key={d.ID} value={d.ID}>
                        {d.department}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Position"
                  name="position_id"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select position">
                    {positions.map((p: PositionInterface) => (
                      <Option key={p.ID} value={p.ID}>
                        {p.position}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row justify="end" gutter={12}>
              <Col>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Col>
              <Col>
                <Button
                  htmlType="button"
                  onClick={() => navigate("/admin/staff")}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* ---------- Modal for Default Password ---------- */}
        <Modal
          title="Default Password"
          open={!!modalPassword}
          onOk={() => {
            setModalPassword(null);
            navigate("/admin/staff");
          }}
          onCancel={() => setModalPassword(null)}
          okText="OK"
        >
          <p>รหัสผ่านเริ่มต้นของผู้ใช้คือ:</p>
          <p style={{ fontWeight: "bold" }}>{modalPassword}</p>
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default AddStaff;
