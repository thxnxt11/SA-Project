import React, { useState } from "react";
import { Table, Input, Button, Space, Typography, Popconfirm, Card, Row, Col  } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
const { Title } = Typography;

const mockData = [
  {
    key: "1",
    name: "ONCE T-Shirt",
    category: "clothes",
    price: 1399,
    stock: 1050,
    minimum: 20,
  },
  {
    key: "2",
    name: "LocknLock myGlass",
    category: "Accessories",
    price: 1888,
    stock: 2220,
    minimum: 50,
  },
  {
    key: "3",
    name: "Bong candy",
    category: "Light stick",
    price: 1600,
    stock: 1000,
    minimum: 40,
  },
];

const EditWarehouse: React.FC = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState(mockData);

  const handleDelete = (key: string) => {
    setData(data.filter(item => item.key !== key));
  };

  const filteredData = data.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Total",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Minimum Quantity",
      dataIndex: "minimum",
      key: "minimum",
    },
    {
      title: "",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} />
          <Button icon={<EditOutlined />} style={{ backgroundColor: "#1677ff", color: "white" }} />
          <Popconfirm title="คุณแน่ใจหรือไม่ที่จะลบ?" onConfirm={() => handleDelete(record.key)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Row gutter={[50, 20]} align="middle">
        <Col span={12}>
          <Title level={3}>Edit Product Infomation</Title>
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <Button type="primary" 
            icon={<PlusOutlined />}
            style={{ background: "#A4A4A4"}}>
            New Merchandise
          </Button>
        </Col>
      </Row>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <Input.Search
          placeholder="Search Product"
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "60%" }}
        />
      </div>

      <Table columns={columns} dataSource={filteredData} pagination={{ pageSize: 5 }} />
    
    </Card>
  );
};

export default EditWarehouse;
