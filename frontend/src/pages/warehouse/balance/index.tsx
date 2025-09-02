import React from "react";
import { Table, Typography, Card } from "antd";

const { Title,Text } = Typography;

const columns = [
  {
    title: "No",
    dataIndex: "key",
    key: "key",
  },
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
    title: "Minimum Quantity",
    dataIndex: "minimum",
    key: "minimum",
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
    key: "1",
    product_id: "1",
    product_name: "Eventix shirt",
    minimum: "100",
    total: "1500",
    notation: "-",
  },
  {
    key: "2",
    product_id: "2",
    product_name: "jetts2holiday",
    minimum: "60",
    total: "1500",
    notation: "-",
  },
  {
    key: "3",
    product_id: "3",
    product_name: "COMPUTER",
    minimum: "20",
    total: "1500",
    notation: "-",
  },
];

const CheckWarehouse: React.FC = () => {
  return (
    <Card style={{ background: "#fff", padding: 0 }}>
      <h1 style={{fontSize: 28, fontWeight : "Bold"}} >🔔 Low Stock</h1>
      <Text type = "secondary" style={{marginLeft:24}}> สินค้าใกล้หมด</Text>

      <Table
        columns={columns}
        dataSource={data}
        bordered
        pagination={{ pageSize: 5 }}
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default CheckWarehouse;