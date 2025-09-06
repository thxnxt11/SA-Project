import React, { useState } from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { Link } from "react-router-dom";
import { forgetPassword } from "../../services/auth";

const { Text } = Typography;

const ForgetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await forgetPassword({
        email: values.email,
      });

      message.success(response.message);
      setEmailSent(true);
      console.log(response); // Remove in production
    } catch (error: any) {
      console.error("Forget password error:", error);
      message.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          textAlign: "center",
        }}
      >
        <div style={{ padding: "20px 0" }}>
          <h1 style={{ fontSize: 24, marginBottom: 16, color: "#52c41a" }}>
            Email Sent!
          </h1>
          <Text type="secondary" style={{ fontSize: 16, display: "block", marginBottom: 20 }}>
            We've sent a password reset link to your email address.
            Please check your inbox and follow the instructions.
          </Text>
          <Link to="/signin">
            <Button type="primary" size="large">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      <h1 style={{ fontSize: 30, display: "flex", justifyContent: "center" }}>
        Forget Password
      </h1>
      <Text
        type="secondary"
        style={{
          display: "block",
          textAlign: "center",
          marginBottom: 24,
          fontSize: 14,
        }}
      >
        Enter your email address and we'll send you a link to reset your password
      </Text>

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { type: "email", message: "Invalid email format" },
            { pattern: /.+@.+\.com$/, message: "Must end with .com" },
            { required: true, message: "Please enter your email" },
          ]}
        >
          <Input placeholder="Enter your email address" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Send Reset Link
          </Button>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
          <Link to="/signin">Back to Sign In</Link>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ForgetPassword;