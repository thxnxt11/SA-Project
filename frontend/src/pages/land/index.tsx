import React from "react";
import { Button, Typography, Space, Card } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const goToWarehouse = () => navigate("/warehouse/dashboardwarehouse");
  const goToShopping = () => navigate("/shoppy");

  return (
    <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card style={{ textAlign: "center", padding: "40px 80px" }}>
        <Title level={2}>Welcome to Eventix</Title>
        <Space direction="vertical" size="large">
          <Button type="primary" size="large" onClick={goToWarehouse}>
            Go to Warehouse
          </Button>
          <Button type="default" size="large" onClick={goToShopping}>
            Go to Shopping
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default LandingPage;
