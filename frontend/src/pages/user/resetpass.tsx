import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { resetPassword } from "../../services/auth";
import { CheckCircleFilled, CloseCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const successColor = "#52c41a";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>("");
  const [form] = Form.useForm();

  // ดูค่ารหัสผ่านแบบเรียลไทม์
  const passwordValue: string = Form.useWatch("password", form) || "";
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

      message.success(response.message);
      navigate("/signin");
    } catch (error: any) {
      console.error("Reset password error:", error);
      message.error(error.message || "Failed to reset password");
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
        Reset Password
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
        Enter your new password below
      </Text>

      <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
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
                  : Promise.reject(),
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
          <Input.Password placeholder="Enter new password" />
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
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Reset Password
          </Button>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
          <Link to="/signin">Back to Sign In</Link>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ResetPassword;
