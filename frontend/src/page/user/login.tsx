import React, { useState } from "react";
import { Form, Input, Button, message, Card, Typography, Space } from "antd";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hook/authContext";
import "./auth.css";

const { Title, Text } = Typography;

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      console.log("result from login():", result);

      message.success("Signed in successfully!");

      const redirectTo =
        location.state?.from?.pathname ||
        new URLSearchParams(location.search).get("redirect");
      console.log("Redirect To Path: ", redirectTo);
      if (redirectTo && redirectTo !== "/signin") {
        console.log("redirecting to:", redirectTo);
        navigate(redirectTo, { replace: true });
        return;
      }

      // ถ้าไม่มี redirect URL ให้ใช้ logic เดิมตาม role
      const role =
        result?.user?.role ??
        result?.role ??
        localStorage.getItem("role") ??
        "";
      const roleIdRaw =
        result?.user?.role_id ??
        result?.role_id ??
        localStorage.getItem("role_id");

      const rid = Number(roleIdRaw);
      const rname = String(role || "").toLowerCase();

      const target =
        rid === 2 || rname === "member"
          ? "/Eventix"
          : rid === 1 || rname === "organizer"
          ? "/organizer/dashboard"
          : rid === 3 || rname === "admin"
          ? "/organizer/dashboard"
          : rid === 4 || rname === "staff"
          ? "/organizer/dashboard"
          : "/signin";

      console.log("computed target:", target, "rid:", rid, "role:", rname);
      navigate(target, { replace: true });
    } catch (e: any) {
      console.error("signin error:", e?.response || e);
      message.error(e?.response?.data?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      <div className="signin-content">
        <Card className="signin-card">
          <div className="signin-header">
            <div className="logo-container">
              <div className="logo">
                <UserOutlined />
              </div>
            </div>
            <Title level={2} className="signin-title">
              Sign In
            </Title>
            <Text className="signin-subtitle">
              Sign in to your account to continue
            </Text>
          </div>

          <Form
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            className="signin-form"
            size="large"
          >
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
                { pattern: /.+@.+\.com$/, message: "Email must end with .com" },
                { required: true, message: "Email is required" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="Enter your email"
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Enter your password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                className="custom-input"
              />
            </Form.Item>
            <Link to="/forget-password" style={{ marginLeft: "68%" }}>
              Forgot password?
            </Link>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="signin-button"
                style={{ marginTop: "16px" }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Form.Item>

            <div className="signin-footer">
              <Space
                direction="vertical"
                align="center"
                style={{ width: "100%" }}
              >
                <Text className="signup-text">
                  Don't have an account?{" "}
                  <Link to="/signup" className="signup-link">
                    Create one here
                  </Link>
                </Text>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;