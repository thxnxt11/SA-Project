// src/pages/auth/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../../services/auth";
import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";
import "./auth.css"; // <<— สำคัญ: ใช้ CSS ชุดที่ให้มา

const { Text } = Typography;

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const successColor = "#52c41a";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>("");
  const [form] = Form.useForm();

  // ดูค่ารหัสผ่านแบบเรียลไทม์ (ฟิลด์ 'new_password')
  const passwordValue: string = Form.useWatch("new_password", form) || "";
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasLower = /[a-z]/.test(passwordValue);
  const hasDigit = /\d/.test(passwordValue);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      message.error("Invalid reset link");
      navigate("/signin");
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams, navigate]);

  const onFinish = async (values: any) => {
    if (values.new_password !== values.confirm_password) {
      message.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword({
        token: token,
        new_password: values.new_password,
      });
      message.success(response.message || "Password has been reset");
      navigate("/signin");
    } catch (error: any) {
      console.error("Reset password error:", error);
      message.error(error?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const RuleItem: React.FC<{ ok: boolean; text: string }> = ({ ok, text }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 12,
        lineHeight: "22px",
        color: ok ? successColor : undefined,
      }}
    >
      <span>{text}</span>
      {ok ? (
        <CheckCircleFilled style={{ color: successColor }} />
      ) : (
        <CloseCircleOutlined />
      )}
    </div>
  );

  return (
    <div className="signin-container">
      {/* พื้นหลัง gradient */}
      <div className="signin-background" />

      {/* รูปลอย */}
      <div className="floating-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
        <div className="shape shape-4" />
        <div className="shape shape-5" />
      </div>

      {/* เนื้อหา */}
      <div className="signin-content">
        <Card className="signin-card">
          <div className="signin-header">
            <div className="logo-container">
              <div className="logo">🔐</div>
            </div>
            <h1 className="signin-title">Reset Password</h1>
            <p className="signin-subtitle">Enter your new password below</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            className="signin-form"
          >
            <Form.Item
              label="New Password"
              name="new_password"
              hasFeedback
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 8, message: "Password must be at least 8 characters" },
                {
                  validator: (_, value) =>
                    !value || PASSWORD_POLICY.test(value)
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "Must include at least one uppercase, one lowercase, and one digit"
                          )
                        ),
                },
              ]}
              extra={
                <div style={{ marginTop: 4 }}>
                  <RuleItem ok={hasUpper} text="At least one [A-Z] character" />
                  <RuleItem ok={hasLower} text="At least one [a-z] character" />
                  <RuleItem ok={hasDigit} text="At least one [0-9] digit" />
                </div>
              }
            >
              <Input.Password
                size="large"
                placeholder="Enter new password"
                className="custom-input"
              />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirm_password"
              hasFeedback
              dependencies={["new_password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Confirm new password"
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
                Reset Password
              </Button>
            </Form.Item>

            <div className="signin-footer">
              <Text className="signup-text">
                Remembered your password?{" "}
                <Link to="/signin" className="signup-link">
                  Back to Sign In
                </Link>
              </Text>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
