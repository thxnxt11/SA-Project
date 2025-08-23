// src/pages/user/login.tsx (only the onFinish + imports)
import React from "react";
import { Form, Input, Button, message } from "antd";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:8000";

const SignIn: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      const res = await axios.post(`${API_URL}/signin`, values);
      console.log("signin response:", res.status, res.data);

      if (res.status !== 200) {
        message.error(res.data?.error || "Sign in failed");
        return;
      }

      const { token, role, role_id } = res.data || {};
      if (!token) {
        message.error("No token returned from server");
        return;
      }

  
      localStorage.setItem("token", token);
      if (role !== undefined) localStorage.setItem("role", String(role));
      if (role_id !== undefined) localStorage.setItem("role_id", String(role_id));

 
      const rid = Number(role_id);
      const rname = String(role || "").toLowerCase();


      const target =
        rid === 2 || rname === "member" ? "/concert/:id" :
        rid === 1 || rname === "organizer" ? "/organizer/dashboard" :
        rid === 3 || rname === "admin" ? "/organizer/dashboard" :
        rid === 4 || rname === "staff" ? "/organizer/dashboard" :
        "/signin";

      console.log("computed target:", target, "rid:", rid, "role:", rname);
      navigate(target, { replace: true });
    } catch (e: any) {
      console.error("signin error:", e?.response || e);
      message.error(e?.response?.data?.error || "Sign in failed");
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
      <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Password" name="password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large">
          Sign In
        </Button>
      </Form.Item>
      <div style={{ textAlign: "center" }}>
        No account? <Link to="/signup">Sign up</Link>
      </div>
    </Form>
  );
};

export default SignIn;
