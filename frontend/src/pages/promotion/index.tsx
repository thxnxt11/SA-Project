"use client";

import SidebarLayout from "../../component/SidebarLayout";
import type React from "react";
import { useState } from "react";
import { Button, Flex, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { PromotionInterface } from "../../interface/promotion";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import EditPromotionModal from "../promotion/edit";

const Promotion: React.FC= () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(
    null
  );

  const columns: TableProps<PromotionInterface>["columns"] = [
    {
      title: "Name",
      dataIndex: "promotion_name",
      key: "promotion_name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Type",
      key: "promotion_type",
      dataIndex: "promotion_type",
    },
    {
      title: "Discount(%)",
      dataIndex: "discount",
      key: "discount",
    },
    {
      title: "StartDate",
      key: "start_date",
      dataIndex: "start_date",
    },
    {
      title: "EndDate",
      key: "end_date",
      dataIndex: "end_date",
    },
    {
      title: "Usage_Limit",
      key: "limit",
      dataIndex: "limit",
    },
    {
      title: "Used_Count",
      dataIndex: "used_count",
      key: "used_count",
    },
    {
      title: "Status",
      key: "promotion_status",
      dataIndex: "promotion_status",
      render: (status: string | undefined) => {
        if (!status) return <Tag color="default">UNKNOWN</Tag>;
        const lower = status.toLowerCase();
        const color = lower === "active" ? "#009f2dff" : "#ff0000ff";
        return <Tag color={color}>{lower.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (record: PromotionInterface) => (
        <Space size="middle">
          <FaEdit
            style={{ fontSize: 25, color: "#0048ffff", cursor: "pointer" }}
            onClick={() => record.ID !== undefined && handleEdit(record.ID)}
          />
          <RiDeleteBin6Line
            style={{ fontSize: 25, color: "#ff0000ff", cursor: "pointer" }}
            onClick={() => record.ID !== undefined && handleDelete(record.ID)}
          />
        </Space>
      ),
    },
  ];

  const data: PromotionInterface[] = [
    {
      ID: 1,
      promotion_name: "Early Bird",
      promotion_type: 1,
      discount: 5,
      start_date: "22/07/2025",
      end_date: "28/07/2025",
      limit: 1000,
      used_count: 249,
      promotion_status: "active",
    },
    {
      ID: 2,
      promotion_name: "VIP50",
      promotion_type: 2,
      discount: 10,
      start_date: "22/07/2025",
      end_date: "28/07/2025",
      limit: 100,
      used_count: 100,
      promotion_status: "inactive",
    },
    {
      ID: 3,
      promotion_name: "Aespa",
      promotion_type: 3,
      discount: 7,
      start_date: "22/07/2025",
      end_date: "28/07/2025",
      limit: 1500,
      used_count: 799,
      promotion_status: "active",
    },
  ];

  const handleEdit = (id: number) => {
    setSelectedPromotionId(id);
    setEditModalVisible(true);
  };

  const handleDelete = (id: number) => {
    console.log(`Delete promotion with ID: ${id}`);
  };

  const handleEditSuccess = () => {
    // Refresh data or update state
    console.log("Promotion updated successfully");
    // You can add logic to refresh the table data here
  };

  return (
    <>
      <SidebarLayout>
        <div
          style={{
            display: "flex",
            alignContent: "center",
          }}
        >
          <h1>Promotion </h1>
          <Link to={"/promotion/add"}>
            <Button
              style={{
                position: "fixed",
                right: 40,
                height: 45,
                fontSize: 17,
                borderRadius: 17,
              }}
              type="primary"
            >
              + New Promotion
            </Button>
          </Link>
        </div>
        <Flex gap="small" vertical>
          <Button
            icon={<SearchOutlined />}
            style={{
              display: "flex",
              justifyContent: "left",
              height: 45,
              fontSize: 17,
              marginTop: 20,
            }}
          >
            Search
          </Button>
        </Flex>
        <Table<PromotionInterface>
          columns={columns}
          dataSource={data}
          style={{ marginTop: 20 }}
          rowKey="ID"
        />
      </SidebarLayout>

      <EditPromotionModal
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        promotionId={selectedPromotionId}
      />
    </>
  );
};

export default Promotion;
