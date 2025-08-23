// src/SignUp.tsx
import React from "react";
import { Form, Input, InputNumber, DatePicker, Select, Button, message ,Card} from "antd";
import { Link } from "react-router-dom";
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
      phonnumber: values.phonenum,
      gender_id: values.gender_id,
      role: values.role_id ?? 2, 
    };

    try {
      const res = await axios.post(`${API_URL}/signup`, user);
      if (res.status === 201) {
        message.success("Sign-up successful!");

      } else {
        message.error(res.data?.error || "Sign-up failed");
      }
    } catch (e: any) {
      message.error(e?.response?.data?.error || "Sign-up failed");
    }
  };

return (
    <Card
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500,
        height: "auto",
        marginTop: 220
      }}
    >
      <h1 style={{fontSize: 30 ,display: "flex",justifyContent: "center"}}>Sign Up</h1>
      <Form
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
          rules={[{ required: true, message: "Please enter your password" }]}
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
            <Option value={0}>Female</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
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
