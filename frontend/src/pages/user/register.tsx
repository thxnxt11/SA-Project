// src/SignUp.tsx
import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Card,
  Typography,
  Divider,
  message,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  ManOutlined,
  WomanOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import type { UserInterface } from "../../interface/user";

const { Option } = Select;
const { Title, Text } = Typography;

const API_URL = "http://localhost:8000";
const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const successColor = "#52c41a";

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  // watch password for live rules
  const passwordValue: string = Form.useWatch("password", form) || "";
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasLower = /[a-z]/.test(passwordValue);
  const hasDigit = /\d/.test(passwordValue);

  const onFinish = async (values: any) => {
    const user: UserInterface & { password: string } = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      age: values.age,
      password: values.password,
      birthday: (values.birthday as dayjs.Dayjs).toISOString(),
      phonenum: values.phonenum,
      gender_id: values.gender_id,
      role_id: 2,
    };

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/signup`, user);
      if (res.status === 201) {
        message.success("Sign-up successful!");
        navigate("/signin", { replace: true });
      } else {
        message.error(res.data?.error || "Sign-up failed");
      }
    } catch (e: any) {
      message.error(e?.response?.data?.error || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  const RuleItem: React.FC<{ ok: boolean; text: string }> = ({ ok, text }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 12,
        lineHeight: "22px",
        color: ok ? successColor : undefined,
      }}
    >
      <span>{text}</span>
      {ok ? (
        <CheckCircleFilled style={{ color: successColor }} />
      ) : (
        <CloseCircleOutlined />
      )}
    </div>
  );

  return (
    <div className="signup-container">
      {/* พื้นหลัง gradient */}
      <div className="signup-background" />

      {/* รูปทรงลอยให้บรรยากาศ */}
      <div className="floating-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
        <div className="shape shape-4" />
        <div className="shape shape-5" />
      </div>

      {/* เนื้อหา */}
      <div className="signup-content">
        <Card className="signup-card" bordered={false}>
          {/* ส่วนหัว */}
          <div className="signin-header">
            <div className="logo-container">
              <div className="logo">
                <UserOutlined />
              </div>
            </div>
            <Title level={2} className="signin-title">
              Sign Up
            </Title>
            <Text className="signin-subtitle">
              Create your account to start Eventix Website
            </Text>
          </div>

          {/* ฟอร์ม */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            className="signin-form"
          >
            {/* ชื่อ-นามสกุล */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="First Name"
                  name="first_name"
                  rules={[
                    { required: true, message: "Please enter your first name" },
                  ]}
                >
                  <Input
                    className="custom-input"
                    size="large"
                    placeholder="First Name"
                    prefix={<UserOutlined className="input-icon" />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Last Name"
                  name="last_name"
                  rules={[
                    { required: true, message: "Please enter your last name" },
                  ]}
                >
                  <Input
                    className="custom-input"
                    size="large"
                    placeholder="Last Name"
                    prefix={<UserOutlined className="input-icon" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* อีเมล - เบอร์โทร */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { type: "email", message: "Invalid email" },
                    { pattern: /.+@.+\.com$/, message: "Must end with .com" },
                    { required: true, message: "Please enter your email" },
                  ]}
                >
                  <Input
                    className="custom-input"
                    size="large"
                    placeholder="name@example.com"
                    prefix={<MailOutlined className="input-icon" />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Phone Number"
                  name="phonenum"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your phone number",
                    },
                  ]}
                >
                  <Input
                    className="custom-input"
                    size="large"
                    placeholder="Phone Number"
                    prefix={<PhoneOutlined className="input-icon" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* รหัสผ่าน - ยืนยันรหัสผ่าน */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Password"
                  name="password"
                  hasFeedback
                  rules={[
                    { required: true, message: "Please enter your password" },
                    {
                      min: 8,
                      message: "Password must be at least 8 characters",
                    },
                    {
                      validator: (_, value) =>
                        !value || PASSWORD_POLICY.test(value)
                          ? Promise.resolve()
                          : Promise.reject(new Error("Use A–Z, a–z and 0–9")),
                    },
                  ]}
                  extra={
                    showPasswordRules && (
                      <div style={{ marginTop: 6 }}>
                        <RuleItem
                          ok={hasUpper}
                          text="At least one [A–Z] character"
                        />
                        <RuleItem
                          ok={hasLower}
                          text="At least one [a–z] character"
                        />
                        <RuleItem
                          ok={hasDigit}
                          text="At least one [0–9] digit"
                        />
                      </div>
                    )
                  }
                >
                  <Input.Password
                    className="custom-input"
                    size="large"
                    placeholder="Password"
                    prefix={<LockOutlined className="input-icon" />}
                    onFocus={() => setShowPasswordRules(true)} // เริ่มพิมพ์จะโชว์ Rule
                    onBlur={(e) => {
                      if (!e.target.value) {
                        setShowPasswordRules(false); // ซ่อนถ้าไม่ได้กรอกอะไร
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value)
                          return Promise.resolve();
                        return Promise.reject(
                          new Error("Passwords do not match")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    className="custom-input"
                    size="large"
                    placeholder="Confirm Password"
                    prefix={<LockOutlined className="input-icon" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* วันเกิด - อายุ */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Birthday"
                  name="birthday"
                  rules={[
                    { required: true, message: "Please select your birthday" },
                  ]}
                >
                  <DatePicker
                    className="custom-input"
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    placeholder="YYYY-MM-DD"
                    suffixIcon={<CalendarOutlined className="input-icon" />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Age"
                  name="age"
                  rules={[{ required: true, message: "Please enter your age" }]}
                >
                  <InputNumber
                    className="custom-input"
                    min={0}
                    max={120}
                    style={{ width: "100%" }}
                    placeholder="Age"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* เพศ (เต็มบรรทัด) */}
            <Row gutter={[16, 0]}>
              <Col span={24}>
                <Form.Item
                  label="Gender"
                  name="gender_id"
                  rules={[
                    { required: true, message: "Please select your gender" },
                  ]}
                >
                  <Select
                    className="custom-input"
                    placeholder="Select gender"
                    size="large"
                  >
                    <Option value={1}>
                      <ManOutlined /> Male
                    </Option>
                    <Option value={2}>
                      <WomanOutlined /> Female
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Button
              className="signin-button"
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Sign Up
            </Button>

            <Divider plain style={{ margin: "16px 0 8px" }}>
              or
            </Divider>

            <div className="signin-footer">
              <span className="signup-text">Already have an account? </span>
              <Link to="/signin" className="signup-link">
                Sign In
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SignUpForm;
