// imports เพิ่ม useState, useNavigate ถ้ายังไม่มี
import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8000";

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      // TODO: map ค่า values -> payload ตามที่คุณต้องการ
      const payload = { /* ...จาก values... */ };

      const res = await axios.post(`${API_URL}/signup`, payload);

      // เช็คสถานะสำเร็จ
      if (res.status === 200 || res.status === 201) {
        message.success("Sign up success!");
        // รอตรงนี้ให้บันทึกเสร็จแล้วค่อย redirect
        navigate("/signin", { replace: true });
      } else {
        message.error("Sign up failed");
      }
    } catch (e: any) {
      console.error(e?.response || e);
      message.error(e?.response?.data?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
      {/* ... ฟิลด์ต่าง ๆ ... */}

      {/* แทนที่ Link + Button ด้วยปุ่ม submit ธรรมดา */}
      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        loading={loading}
      >
        Sign Up
      </Button>
    </Form>
  );
};

export default SignUpForm;
