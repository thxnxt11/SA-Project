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
  Spin,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { userAPI } from "../../../services/https/index";
import type { GenderInterface } from "../../../interface/gender";
import type { DepartmentInterface, PositionInterface, RoleInterface, UpdateUserPayload, UserInterface } from "../../../interface/user";


const { Option } = Select;

const EditStaff: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [genders, setGenders] = useState<GenderInterface[]>([]);
  const [roles, setRoles] = useState<RoleInterface[]>([]);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [positions, setPositions] = useState<PositionInterface[]>([]);

  // ---------- Load staff + dropdowns ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dd, userRes] = await Promise.all([
          userAPI.getDropdowns(),
          userAPI.getStaffById(id!),
        ]);

        setGenders(dd.genders);
        setRoles(dd.roles);
        setDepartments(dd.departments);
        setPositions(dd.positions);

        const user: UserInterface = userRes.data;
        form.setFieldsValue({
          firstName: user.first_name,
          lastName: user.last_name,
          birthday: user.birthday ? dayjs(user.birthday) : null,
          address: user.address,
          gender_id: user.gender_id,
          email: user.email,
          phone_number: user.phone_number,
          role_id: user.role_id,
          department_id: user.department_id,
          position_id: user.position_id,
        });
      } catch (err) {
        console.error(err);
        message.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form]);

  // ---------- Update staff ----------
  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);

      // ตรวจสอบ FK
      const genderExists = genders.some((g) => g.ID === Number(values.gender_id));
      const roleExists = roles.some((r) => r.ID === Number(values.role_id));
      const deptExists = departments.some((d) => d.ID === Number(values.department_id));
      const posExists = positions.some((p) => p.ID === Number(values.position_id));

      if (!genderExists || !roleExists || !deptExists || !posExists) {
        message.error("ข้อมูลบางอย่างไม่ถูกต้อง กรุณาตรวจสอบ dropdown");
        return;
      }

      // Map form values ให้ตรงกับ backend
      const payload: UpdateUserPayload = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
        phone_number: values.phone_number || "",
        address: values.address || "",
        gender_id: Number(values.gender_id),
        role_id: Number(values.role_id),
        department_id: Number(values.department_id),
        position_id: Number(values.position_id),
      };

      await userAPI.updateUser(id!, payload);

      // --- ส่งกลับไป Staff พร้อม state updatedUserName ---
      navigate("/admin/staff", { state: { updatedUserName: `${values.firstName} ${values.lastName}` } });
    } catch (err: any) {
      console.error("Axios error:", err.response?.data);
      message.error(err.response?.data?.error || "❌ บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin tip="Loading..." style={{ marginTop: 100 }} />;

  return (
    <SidebarLayout>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          แก้ไขข้อมูลทีมงาน
        </h1>

        <Card bordered style={{ borderRadius: 8 }}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First name"
                  name="firstName"
                  rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                >
                  <Input placeholder="Enter first name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last name"
                  name="lastName"
                  rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
                >
                  <Input placeholder="Enter last name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Birthday"
                  name="birthday"
                  rules={[{ required: true, message: "กรุณาเลือกวันเกิด" }]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[{ required: true, message: "กรุณากรอกที่อยู่" }]}
                >
                  <Input.TextArea placeholder="Enter address" autoSize />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Gender"
                  name="gender_id"
                  rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}
                >
                  <Select placeholder="Select gender">
                    {genders.map((g) => (
                      <Option key={g.ID} value={g.ID}>
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
                  rules={[{ type: "email", required: true, message: "กรุณากรอกอีเมลถูกต้อง" }]}
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
                  rules={[{ required: true, message: "กรุณาเลือก Role" }]}
                >
                  <Select placeholder="Select role">
                    {roles.map((r) => (
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
                  rules={[{ required: true, message: "กรุณาเลือก Department" }]}
                >
                  <Select placeholder="Select department">
                    {departments.map((d) => (
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
                  rules={[{ required: true, message: "กรุณาเลือก Position" }]}
                >
                  <Select placeholder="Select position">
                    {positions.map((p) => (
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
                <Button type="primary" htmlType="submit" loading={saving}>
                  Save
                </Button>
              </Col>
              <Col>
                <Button htmlType="button" onClick={() => navigate("/admin/staff")}>
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default EditStaff;
