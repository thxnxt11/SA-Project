/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, Button, Space } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import AdminsidebarLayout from "../../components/sidebarLayout";
import { useNavigate } from "react-router-dom";
import { assignmentAPI, venueAPI } from "../../services/https";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { Title } = Typography;

  const [totalVenues, setTotalVenues] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [totalConcerts, setTotalConcerts] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [latestVenues, setLatestVenues] = useState<any[]>([]);
  const [latestStaff, setLatestStaff] = useState<any[]>([]);

  useEffect(() => {
    // Total Staff & Latest Staff
    assignmentAPI.getAllStaff()
      .then((res: any) => {
        if (res?.status === 200) {
          setTotalStaff(res.data.length);
          setLatestStaff(res.data.slice(-5).reverse());
        }
      })
      .catch(err => console.error(err));

    // Total Tasks
    assignmentAPI.getAll()
      .then((res: any) => {
        if (res?.status === 200) setTotalTasks(res.data.length);
      })
      .catch(err => console.error(err));

    // Total Concerts
    assignmentAPI.getConcerts()
      .then((res: any) => {
        if (res?.status === 200) setTotalConcerts(res.data.length);
      })
      .catch(err => console.error(err));

    // Total Venues & Latest Venues
    venueAPI.getAll()
      .then((res: any) => {
        if (res?.status === 200) {
          setTotalVenues(res.data.length);
          setLatestVenues(res.data.slice(-5).reverse());
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <AdminsidebarLayout>
      <div style={{ padding: "24px" }}>
        <h1 style={{ fontWeight: "bold" }}>Dashboard</h1>
        <p>Dashboard page showing details</p>

        {/* Summary Cards */}
        <Row gutter={16}>
          <Col span={6}>
            <Card style={{ background: "#BFD8F8" }}>
              <h3>All Venues</h3>
              <Title>{totalVenues}</Title>
              <h3>Locations</h3>
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ background: "#BFD8F8" }}>
              <h3>Total Staff</h3>
              <Title>{totalStaff}</Title>
              <h3>People</h3>
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ background: "#BFD8F8" }}>
              <h3>Concerts</h3>
              <Title>{totalConcerts}</Title>
              <h3>Ongoing Events</h3>
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ background: "#BFD8F8" }}>
              <h3>Assigned Tasks</h3>
              <Title>{totalTasks}</Title>
              <h3>Tasks</h3>
            </Card>
          </Col>
        </Row>

        {/* Latest Sections */}
        <Row gutter={16}>
          <Col span={12}>
            <Card
              style={{ marginTop: 24, border: "3px solid #ccc", borderRadius: 8 }}
              title="Latest venue"
              extra={<Button type="primary" onClick={() => navigate("/addvenue")}>+ Add venue</Button>}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {latestVenues?.map((venue) => (
                  <Card
                    key={venue.ID}
                    type="inner"
                    title={venue.venue_name}
                  >
                    <p><EnvironmentOutlined />  {venue.location} </p>
                    <p>Capacity : {venue.venue_capacity?.toLocaleString() } คน</p> 
                    <p>Type : {venue.venue_type?.venue_type}</p>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              style={{ marginTop: 24, border: "3px solid #ccc", borderRadius: 8 }}
              title="Latest staff"
              extra={<Button type="primary" onClick={() => navigate("/addstaff")}>+ Add staff</Button>}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {latestStaff?.map((staff) => (
                  <Card key={staff.ID} type="inner" title={`ID :  ${staff.ID} - ${staff.first_name} ${staff.last_name}`} >
                   <p> Position: {staff.position?.position } </p> 
                   <p>Department : {staff.department?.department } </p>
                   <p>Role : {staff.role?.role}</p>
                  </Card>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminsidebarLayout>
  );
};

export default Dashboard;
