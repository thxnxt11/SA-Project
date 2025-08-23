// src/SignUp.tsx
import React from "react";
import { Form, Input, InputNumber, DatePicker, Select, Button, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import type{ UserInterface } from "../../interface/user"; 


const { Option } = Select;
const API_URL = "http://localhost:8000";

const SignUpForm: React.FC = () => {
  const onFinish = async (values: any) => {
    // convert to your interface
    const user: UserInterface & { password: string } = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      age: values.age,
      password: values.password,
      birthday: (values.birthday as dayjs.Dayjs).toISOString(),
      phonenum: values.phonenum,
      gender_id: values.gender_id,
      role_id: values.role_id ?? 2, 
    };

    try {
      const res = await axios.post(`${API_URL}/signup`, user);
      if (res.status === 201) {
        message.success("Sign-up successful!");
        return <div>Private Stuff</div>;
      } else {
        message.error(res.data?.error || "Sign-up failed");
      }
    } catch (e: any) {
      message.error(e?.response?.data?.error || "Sign-up failed");
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} initialValues={{ age: 18, gender_id: 1, role_id: 2 }}>
      <Form.Item label="First Name" name="first_name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Last Name" name="last_name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Password" name="password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={["password"]}
        rules={[
          { required: true },
          ({ getFieldValue }) => ({
            validator(_, value) {
              return !value || getFieldValue("password") === value
                ? Promise.resolve()
                : Promise.reject(new Error("Passwords do not match"));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item label="Birthday" name="birthday" rules={[{ required: true }]}>
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item label="Age" name="age" rules={[{ required: true }]}>
        <InputNumber min={0} max={120} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item label="Phone Number" name="phonenum" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Gender" name="gender_id" rules={[{ required: true }]}>
        <Select>
          <Option value={1}>Male</Option>
          <Option value={0}>Female</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Sign Up
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SignUpForm;
