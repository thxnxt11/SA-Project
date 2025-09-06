// src/pages/auth/ForgetPassword.tsx
import React, { useState } from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { Link } from "react-router-dom";
import { forgetPassword } from "../../services/auth";
import "./auth.css";

const { Text } = Typography;

const ForgetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await forgetPassword({ email: values.email });
      message.success(response.message || "Sent reset link");
      setEmailSent(true);
    } catch (error: any) {
      console.error("Forget password error:", error);
      message.error(error?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      {/* พื้นหลัง gradient */}
      <div className="signin-background" />

      {/* เนื้อหา */}
      <div className="signin-content">
        <Card className="signin-card">
          {/* Header */}
          <div className="signin-header">
            <div className="logo-container">
              <div className="logo">🔒</div>
            </div>
            <h1 className="signin-title">
              {emailSent ? "Email Sent!" : "Forget Password"}
            </h1>
            <p className="signin-subtitle">
              {emailSent
                ? "We’ve sent a password reset link to your email. Please check your email."
                : "Enter your email address and we’ll send you a link to reset your password."}
            </p>
          </div>

          {/* เมื่อส่งเมลแล้ว แสดงปุ่มกลับ Sign In */}
          {emailSent ? (
            <div className="signin-footer">
              <Link to="/signin">
                <Button type="primary" size="large" className="signin-button">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            // ฟอร์มลืมรหัสผ่าน
            <Form
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="signin-form"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Invalid email format" },
                  { pattern: /.+@.+\.com$/, message: "Must end with .com" },
                ]}
              >
                {/* ผูก className กับ CSS ที่ให้ */}
                <Input
                  size="large"
                  placeholder="Enter your email address"
                  className="custom-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  className="signin-button"
                >
                  Send Reset Link
                </Button>
              </Form.Item>

              <div className="signin-footer">
                <Text className="signup-text">
                  Remember your password?{" "}
                  <Link to="/signin" className="signup-link">
                    Back to Sign In
                  </Link>
                </Text>
              </div>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgetPassword;
