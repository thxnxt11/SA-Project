import React, { useEffect, useState } from "react";
import { Table, Typography, Card, Row, Col, message, type StatisticProps, Statistic, Tag } from "antd";
import { movementsAPI, productsAPI } from "../../services/https";
const { Title } = Typography;
import CountUp from 'react-countup';
import "./index.css";

const columns = [
  // { title: "ProductID", dataIndex: "product_id", key: "product_id" },
  { title: "Name", dataIndex: "product_name", key: "product_name" },
  { title: "Variant", dataIndex: "variant_name", key: "variant_name" },
  { title: "Action", dataIndex: "updated", key: "updated",
     render: (action: string) => {
      let color = "blue";
      if (action === "IN") color = "green";
      else if (action === "OUT") color = "red";
      else if (action === "EDIT") color = "orange";

      return <Tag color={color}>{action}</Tag>;
    },},
  { title: "Amounts", dataIndex: "amount", key: "amount" },
  { title: "Total", dataIndex: "total", key: "total" },
  { title: "Staff", dataIndex: "staff_name", key: "staff_name" },
  {
    title: "Updated At",
    dataIndex: "updated_at",
    key: "updated_at",
    render: (text: string) => new Date(text).toLocaleString("th-TH"),
  },
];

const DashboardWarehouse: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchStockMovements = async () => {
    try {
      const res = await movementsAPI.getAllProducts();
      if (res.status === 200) {

        console.log(res.data);
        setData(res.data);
      } else {
        messageApi.error("ไม่สามารถโหลดข้อมูล stock movement ได้");
      }
    } catch (err) {
      console.error(err);
      messageApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };
  const fetchProducts = async () => {
    try {
      const res = await productsAPI.getAllProducts();
      setProducts(res.data); 
      console.log("Products: ",res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    };
  }

  useEffect(() => {
    fetchProducts();
    fetchStockMovements();
  }, []);
  const totalAdded = products.reduce((acc, p) => acc + (p.variants?.length || 0), 0);
  const totalQuantity = products.reduce((acc, p) => acc + (p.total || 0),0);
  const totalSales = products.reduce((acc, p) => acc + (p.sales || 0),0);
  const lowStock = products.reduce((acc, p) => {
    return acc + (p.total < p.minimum ? 1 : 0);
  }, 0);

  const formatter: StatisticProps['formatter'] = (value) => (
    <CountUp end={value as number} separator="," />
  );

  // const statStyle = {background: "#e6edf7ff", padding: 0 , height: 150, textAlign: "center"} as const;

  return (
    <div style={{ padding: 10 ,height:"100%"}}>
      {contextHolder}   
      <div>
        <Title level={3}>Warehouse Overview</Title>
        <Row gutter={[50, 40]} style={{width:"80%",margin:"auto"}}>
          <Col span={6}>
            <Card className="statStyle" style={{background: "#C6E7FF"}}>
              <Statistic className="stat-custom"
                title="เพิ่มสินค้าแล้ว" value={totalAdded} formatter={formatter} />
              <div className="stat-suffix-line">รายการ</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="statStyle" style={{background: "#D4F6FF",}}>
              <Statistic className="stat-custom"
                title="ยอดขายทั้งหมด" value={totalSales} formatter={formatter} />
              <div className="stat-suffix-line">ชิ้น</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="statStyle" style={{background: "#FBFBFB", }}>
              <Statistic className="stat-custom"
                title="จำนวนทั้งหมด" value={totalQuantity} formatter={formatter}  />
              <div className="stat-suffix-line">ชิ้น</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className="statStyle" style={{background: "#FFDDAE"}}>
              <Statistic className="stat-custom"
                title="🔔 ใกล้หมด" value={lowStock} formatter={formatter} />
              <div className="stat-suffix-line">รายการ</div>
            </Card>
          </Col>
        </Row>
      </div>
      <div style={{height:"70%",background: "#ffffffff", }}>
        <Title level={4} style={{ marginTop: 10}}>Latest update</Title>
        <Table
          columns={columns}
          dataSource={data}
          bordered
          pagination={{ pageSize: 7  }}
          rowKey={(record) => record.id}
          style={{ marginTop: 24  ,width:"95%",margin:"auto"}}
          />
      </div>
    </div>
  );
};

export default DashboardWarehouse;