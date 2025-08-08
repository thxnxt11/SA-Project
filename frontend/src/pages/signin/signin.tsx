// src/SignIn.tsx
import React from "react";
import { Form, Input, Button, Card } from "antd";
import { Link } from "react-router-dom";

const SignInForm: React.FC<{ onFinish: (values: any) => void }> = ({
  onFinish,
}) => {
  return (
    <Card
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500,
      }}
    >
      <h1 style={{fontSize: 30 ,display: "flex",justifyContent: "center"}}>SignIn</h1>
      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
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

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Sign In
          </Button>
        </Form.Item>
        <Form.Item>
          <Link to="/signup">Don't have an account?</Link>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SignInForm;
