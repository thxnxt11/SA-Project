import React from "react";
import { Result, Button, Typography, Tag, Space } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const { Paragraph, Text } = Typography;

interface AccessDeniedProps {
  requiredRoles?: string[]; // บอกว่าหน้าที่นี้ต้องการ role อะไรบ้าง (แสดงบนหน้า)
  currentRole?: string; // role ปัจจุบันของผู้ใช้ (จะแสดงให้เห็น)
  onSignOut?: () => void; // ถ้าต้องการให้ผู้ใช้กด Sign out ได้
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRoles,
  currentRole,
  onSignOut,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Result
      status="403"
      title="Access Denied"
      subTitle={
        <Space direction="vertical" size={4}>
          <Paragraph style={{ margin: 0 }}>
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
            {requiredRoles?.length ? (
              <>
                {" "}
                จำเป็นต้องเป็น{" "}
                {requiredRoles.map((r) => (
                  <Tag key={r} color="geekblue">
                    {r}
                  </Tag>
                ))}
              </>
            ) : null}
          </Paragraph>
          {currentRole && (
            <Text type="secondary">
              บทบาทปัจจุบันของคุณ: <Tag>{currentRole}</Tag>
            </Text>
          )}
          <Text type="secondary">
            เส้นทาง: <code>{location.pathname}</code>
          </Text>
        </Space>
      }
      extra={[
        <Button key="home" type="primary" onClick={() => navigate("/")}>
          กลับหน้าแรก
        </Button>,
        <Button key="back" onClick={() => navigate(-1)}>
          ย้อนกลับ
        </Button>,
        onSignOut ? (
          <Button key="signout" danger onClick={onSignOut}>
            Sign out
          </Button>
        ) : null,
      ]}
    />
  );
};

export default AccessDenied;
