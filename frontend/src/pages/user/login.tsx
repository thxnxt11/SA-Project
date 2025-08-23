// src/pages/user/login.tsx (only the onFinish + imports)
import React from "react";
import { Form, Input, Button, message, Card } from "antd";
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
        rid === 2 || rname === "member" ? "/concert" :
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
    <Card
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500,
      }}
    >
      <h1 style={{fontSize: 30 ,display: "flex",justifyContent: "center"}}>Sign In</h1>
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


export default SignIn;
