// src/SignUp.tsx
import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  message,
  Card,
} from "antd";
import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import type { UserInterface } from "../../interface/user";

const { Option } = Select;
const API_URL = "http://localhost:8000";

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const successColor = "#52c41a";

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // ดูค่ารหัสผ่านแบบเรียลไทม์
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
    <Card
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500,
        height: "auto",
        marginTop: 220,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      <h1 style={{ fontSize: 30, display: "flex", justifyContent: "center" }}>
        Sign Up
      </h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ age: 18, gender_id: 1 }}
        requiredMark={false}
      >
        <Form.Item
          label="First Name"
          name="first_name"
          rules={[{ required: true, message: "Please enter your first name" }]}
        >
          <Input placeholder="First Name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="last_name"
          rules={[{ required: true, message: "Please enter your last name" }]}
        >
          <Input placeholder="Last Name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { type: "email", message: "Invalid email" },
            { pattern: /.+@.+\.com$/, message: "Must end with .com" },
            { required: true, message: "Please enter your email" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          hasFeedback
          // validator จริง ๆ ยังบังคับรวม ๆ ว่าต้องผ่านทั้งสามเงื่อนไข
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 8, message: "Password must be at least 8 characters" },
            {
              validator: (_, value) =>
                !value || PASSWORD_POLICY.test(value)
                  ? Promise.resolve()
                  : Promise.reject(),
            },
          ]}
          extra={
            <div style={{ marginTop: 4 }}>
              <RuleItem ok={hasUpper} text="At least one [A-Z] character" />
              <RuleItem ok={hasLower} text="At least one [a-z] character" />
              <RuleItem ok={hasDigit} text="At least one [0-9] digit" />
            </div>
          }
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Birthday"
          name="birthday"
          rules={[{ required: true, message: "Please select your birthday" }]}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Age"
          name="age"
          rules={[{ required: true, message: "Please enter your age" }]}
        >
          <InputNumber min={0} max={120} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phonenum"
          rules={[
            { required: true, message: "Please enter your phone number" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Gender"
          name="gender_id"
          rules={[{ required: true, message: "Please select your gender" }]}
        >
          <Select>
            <Option value={1}>Male</Option>
            <Option value={2}>Female</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Sign Up
          </Button>
        </Form.Item>
        <Form.Item>
          <Link to="/signin">got an account?</Link>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SignUpForm;