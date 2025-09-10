import React, { useEffect, useState } from "react";
import { Table, Typography, Card, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import SidebarLayout from "../../../component/layout/SidebarLayout";
import { productsAPI } from "../../../services/https";

const { Text } = Typography;

type Row = {
  product_id: number;
  product_name: string;
  minimum: number;
  total: number;
};

const CheckWarehouse: React.FC = () => {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getAllProducts();

        const rows: Row[] = (res.data as any[]).map((p) => ({
          product_id: Number(p.ID ?? p.id),
          product_name: String(p.product_name ?? p.ProductName ?? ""),
          minimum: Number(p.minimum ?? p.Minimum ?? 0),
          total: Number(p.total ?? p.Total ?? 0),
        }));
        rows.sort((a, b) => a.total - b.total);

        setData(rows);
      } catch (err) {
        console.error(err);
        message.error("ไม่สามารถโหลดข้อมูลสินค้าได้");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

const columns: ColumnsType<Row> = [
  {
    title: "No",
    key: "no",
    render: (_: any, __: any, index: number) => index + 1,
    align: "center",
    width:100,
  },
  {
    title: "Product ID",
    dataIndex: "product_id",
    key: "product_id",
    align: "center",
    width:150,
  },
  {
    title: "Name",
    dataIndex: "product_name",
    key: "product_name",
    align: "center",
    width:500,
  },
  {
    title: "Minimum Quantity",
    dataIndex: "minimum",
    key: "minimum",
    align: "center",
  },
  {
    title: "Total",
    dataIndex: "total",
    key: "total",
    align: "center",
    sorter: (a: Row, b: Row) => a.total - b.total,
    render: (total: number, record: Row) => (
      <div
        style={{
          backgroundColor: total < record.minimum ? "#ffcccc" : "inherit",
          padding: "4px 8px",
          borderRadius: 4,
          textAlign: "right",
        }}
      >
        {total}
      </div>
    ),
  },
];

  return (
    <SidebarLayout>
      <div style={{ background: "#fff", padding: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold" }}>🔔 Low Stock</h1>
        <Text type="secondary" style={{ marginLeft: 24 ,}}>
          สินค้าใกล้หมด
        </Text>

        <Table
          rowKey={(record) => String(record.product_id)}
          columns={columns}
          dataSource={data}
          bordered
          pagination={{ pageSize: 5 }}
          loading={loading}
          style={{ marginTop: 16,width:"80%", margin:"20px auto"}}
          />
      </div>
    </SidebarLayout>
  );
};

export default CheckWarehouse;
