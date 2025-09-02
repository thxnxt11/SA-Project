import React, { useEffect, useState } from "react";
import { Table, Typography, Card, Row, Col, message } from "antd";
import {
  concertAPI,
  categoriesAPI,
  colorsAPI,
  sizesAPI
} from "./../../services/https";
const { Title,Text} = Typography;

const columns = [
  {
    title: "ProductID",
    dataIndex: "product_id",
    key: "product_id",
  },
  {
    title: "Name",
    dataIndex: "product_name",
    key: "product_name",
  },
  {
    title: "Amounts",
    dataIndex: "amount",
    key: "amount",
  },
  {
    title: "Updated",
    dataIndex: "updated",
    key: "updated",
  },
  {
    title: "Total",
    dataIndex: "total",
    key: "total",
  },
  {
    title: "note",
    dataIndex: "notation",
    key: "notation",
  },
];

const data = [
  {
    product_id: "1",
    product_name: "Eventix shirt",
    amount: "100",
    total: "1500",
    updated: "Increased",
    notation: "-",

  },
  {
    product_id: "2",
    product_name: "jetts2holiday",
    amount: "60",
    total: "1500",
    updated: "Decreased",
    notation: "-",
  },
  {
    product_id: "3",
    product_name: "COMPUTER",
    amount: "20",
    total: "1500",
    updated: "Increased",
    notation: "-",
  },
];

const Dashboard: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  // const [apiLoaded, setApiLoaded] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const category = Form.useWatch("category", form);

  const [categories, setCategories] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [concerts, setConcerts] = useState<any[]>([]);
  const onGetInitialData = async () => {
    try {
      const [concertsRes, categoriesRes, colorsRes, sizesRes] = await Promise.all([
        concertAPI.getAll(),
        categoriesAPI.getAllCategories(),
        colorsAPI.getAllColors(),
        sizesAPI.getAllSizes(),
      ]);
      if (concertsRes.status === 200 && categoriesRes.status === 200 && colorsRes.status === 200 && sizesRes.status === 200) {
        setConcerts(concertsRes.data);
        setCategories(categoriesRes.data);
        setColors(colorsRes.data);
        setSizes(sizesRes.data);
        // setApiLoaded(true);
      } else {
        messageApi.open({
          type: "error",
          content: "ไม่สามารถดึงข้อมูลเริ่มต้นได้",
        });
        setTimeout(() => {
          // navigate("/organizer/promotion");
        }, 2000);
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
      console.error("Fetch error:", error);
      setTimeout(() => {
        // navigate("/organizer/promotion");
      }, 2000);
    }
  };    

  useEffect(() => {
    onGetInitialData();
    return () => {};
}, []);

  return (
    <Card style={{ background: "#fff", padding: 10 }}>
      <Title style={{ padding : 0 ,  marginTop: 0, marginBottom : 0, fontSize: 32}}>DashBoard</Title>
      <Title style={{ padding : 10 , marginTop: 0, fontSize: 16 }}>Warehouse Overview</Title>
      <Row gutter={[50, 40]} style={{ padding : 10  }}>
        <Col span={6}>
          <Card
            style={{background: "#BFD8F8",height: 150,display: "flex", flexDirection: "column",justifyContent: "center", }}>
            <div style={{ textAlign: "left" }}>
              <Title level={5} style={{ margin: 5, fontSize: 16 }}>All products</Title>
            </div>
            <div style={{ textAlign: "center" }}>
              <Title style={{ margin: 0, fontSize: 40 }}>199657</Title>
            </div>
            <div style={{ textAlign: "right" }}>
              <Title level={5} style={{ margin: 0, fontSize: 16 }}>In the warehouse</Title>
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card
            style={{background: "#BFD8F8",height: 150,display: "flex", flexDirection: "column",justifyContent: "center", }}>
            <div style={{ textAlign: "left" }}>
              <Title level={5} style={{ margin: 5, fontSize: 16 }}>This month's sales</Title>
            </div>
            <div style={{ textAlign: "center" }}>
              <Title style={{ margin: 0, fontSize: 40 }}>89147</Title>
            </div>
            <div style={{ textAlign: "right" }}>
              <Title level={5} style={{ margin: 0, fontSize: 16 }}>item</Title>
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card
            style={{background: "#BFD8F8",height: 150,display: "flex", flexDirection: "column",justifyContent: "center", }}>
            <div style={{ textAlign: "left" }}>
              <Title level={5} style={{ margin: 5, fontSize: 16 }}>All added</Title>
            </div>
            <div style={{ textAlign: "center" }}>
              <Title style={{ margin: 0, fontSize: 40 }}>12450</Title>
            </div>
            <div style={{ textAlign: "right" }}>
              <Title level={5} style={{ margin: 0, fontSize: 16 }}>item</Title>
            </div>
          </Card>
        </Col>

        <Col span={6}>
          <Card
            style={{background: "#BFD8F8",height: 150,display: "flex", flexDirection: "column",justifyContent: "center", }}>
            <div style={{ textAlign: "left" }}>
              <Title level={5} style={{ margin: 5, fontSize: 16 }}>Notification</Title>
            </div>
            <div style={{ textAlign: "center" }}>
              <Title style={{ margin: 0, fontSize: 40 }}>69</Title>
            </div>
            <div style={{ textAlign: "right" }}>
              <Title level={5} style={{ margin: 0, fontSize: 16 }}>message</Title>
            </div>
          </Card>
        </Col>
      </Row>
      <Title style={{ marginTop: 24, fontSize: 16 }}>Latest update</Title>
      
      <Table
        columns={columns}
        dataSource={data}
        bordered
        pagination={{ pageSize: 5 }}
        className="centered-table"
        style={{ marginTop: 24 }}
      />
    </Card>
  );
};

export default Dashboard;
