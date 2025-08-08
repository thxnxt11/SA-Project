
import React from "react";
import { Card, Col, Row, Typography, Button, Tag, Space } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import AdminsidebarLayout from "../../components/sidebarLayout";
import { useNavigate } from "react-router-dom";



const Dashboard: React.FC = () => {
const navigate = useNavigate();
const { Title } = Typography;
  return (
    <AdminsidebarLayout>
        <div style={{ padding: "24px" }}>
        {/* Header */}
            <h1 style={{ fontWeight:"bold"}}>Dashboard</h1>
            <p>หน้าแดชบอร์ดแสดงรายละเอียด</p>
      

        {/* Summary Cards */}
        <Row gutter={16} style={{}}>
            <Col span={6}>
            <Card style={{ background: "#cacbc9ff" }}>
                <h3>สถานที่ทั้งหมด</h3>
                <Title>24</Title>
                <h3>แห่ง</h3>
             
            </Card>
            </Col>
            <Col span={6}>
            <Card style={{ background: "#cacbc9ff" }}>
                <h3>ทีมงานทั้งหมด</h3>
                <Title>156</Title>
                <h3>คน</h3>
            
            </Card>
            </Col>
            <Col span={6}>
            <Card style={{ background: "#cacbc9ff" }}>
                <h3>คอนเสิร์ต</h3>
                <Title>8</Title>
                <h3>งานที่กำลังดำเนินการ</h3>
            </Card>
            </Col>
            <Col span={6}>
            <Card style={{ background: "#cacbc9ff" }}>
                <h3>งานที่มอบหมาย</h3>
                <Title>190</Title>
                <h3>งาน</h3> 
            </Card>
            </Col>
        </Row>

        {/* Recent Sections */}
        <Row gutter={16} >
            <Col span={12} >
            <Card
                style={{ marginTop: 24,border: "3px solid #ccc", borderRadius: 8  }}
                title="สถานที่ล่าสุด"
                extra={<Button type="primary" onClick={() => navigate("/addvenue")}>+ เพิ่มสถานที่</Button>}
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                <Card type="inner" title="Thunder Dome" extra={<Tag color="purple">พร้อมใช้งาน</Tag>}>
                    <EnvironmentOutlined /> กรุงเทพฯ – 15,000 คน
                </Card>
                <Card type="inner" title="Royal Arena" extra={<Tag color="default">กำลังใช้งาน</Tag>}>
                    <EnvironmentOutlined /> เชียงใหม่ – 8,500 คน
                </Card>
                </Space>
            </Card>
            </Col>

            <Col span={12} >
            <Card
                style={{ marginTop: 24,border: "3px solid #ccc", borderRadius: 8  }}
                title="ทีมงานล่าสุด"
                extra={<Button type="primary" onClick={() => navigate("/addstaff")}>+ เพิ่มทีมงาน</Button>}
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                <Card type="inner" title="นายสมชาย ใจดี" extra={<Tag color="purple">ปฏิบัติงาน</Tag>}>
                    Stage Manager – เทคนิค
                </Card>
                <Card type="inner" title="นางสาวอารี สวยงาม" extra={<Tag color="default">วันหยุด</Tag>}>
                    Sound Engineer – เสียง
                </Card>
                </Space>
            </Card>
            </Col>
        </Row>
        </div>
    </AdminsidebarLayout>
  );
};

export default Dashboard;
