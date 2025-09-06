import React from "react";
import { Form, Input, Button, message, Card } from "antd";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hook/authContext";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    try {
      const result = await login(values.email, values.password);
      console.log("result from login():", result);

      message.success("Signed in!");

      const redirectTo =
        location.state?.from?.pathname ||
        new URLSearchParams(location.search).get("redirect");

      if (redirectTo && redirectTo !== "/signin") {
        console.log("redirecting to:", redirectTo);
        navigate(redirectTo, { replace: true });
        return; // สำคัญ! ต้อง return เพื่อไม่ให้รันโค้ดต่อ
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
          ? "/concerts"
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
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      <h1 style={{ fontSize: 30, display: "flex", justifyContent: "center" }}>
        Sign In
      </h1>
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

        <Form.Item style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link to="/signup">Don't have an account?</Link>
            <Link to="/forget-password">Forgot password?</Link>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SignIn;
