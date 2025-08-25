import SidebarLayout from "../../component/layout/SidebarLayout";
import type React from "react";
import { useState, useEffect } from "react";
import { Button, Flex, Space, Table, Tag, message, Modal } from "antd";
import type { TableProps } from "antd";
import { SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { PromotionInterface } from "../../interface/promotion";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import EditPromotionModal from "../promotion/edit";
import { promotionAPI } from "../../services/https";
import { useAuth } from "../../hook/authContext";

const { confirm } = Modal;
// Helper function สำหรับ format วันที่
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
};

const Promotion: React.FC = () => {
  const { user } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | null>(
    null
  );
  const [promotions, setPromotions] = useState<PromotionInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await promotionAPI.getAll();
      console.log("API Response:", res); // Debug log

      if (res && res.status === 200) {
        console.log("Promotions data:", res.data); // Debug log
        setPromotions(res.data);
      } else {
        message.error("ดึงข้อมูลโปรโมชั่นไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

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
      dataIndex: "promotion_type_id",
      render: (_, record) => {
        const typeMap: Record<number, string> = {
          1: "Early Bird",
          2: "Code",
          3: "Concert",
        };
        const typeId = record.promotion_type_id;
        return (
          <Tag color="#0048ffc7">
            {typeId ? typeMap[typeId] || "Unknown" : "-"}
          </Tag>
        );
      },
    },
    {
      title: "Discount (%)",
      dataIndex: "discount",
      key: "discount",
      render: (value) => `${value || 0}%`,
    },
    {
      title: "Start Date",
      key: "start_date",
      dataIndex: "start_date",
      render: (date) => formatDate(date),
    },
    {
      title: "End Date",
      key: "end_date",
      dataIndex: "end_date",
      render: (date) => formatDate(date),
    },
    {
      title: "Limit",
      key: "limit",
      dataIndex: "limit",
      render: (value) => value || "-",
    },
    {
      title: "Used",
      dataIndex: "used_count",
      key: "used_count",
      render: (value) => value || 0,
    },
    {
      title: "Status",
      dataIndex: "promotion_status",
      key: "promotion_status",
      render: (status: string | undefined, record: PromotionInterface) => {
        const actualStatus =
          status ||
          record.promotion_status ||
          (record as any).Status ||
          (record as any).promotion_status;

        if (!actualStatus) return <Tag color="default">UNKNOWN</Tag>;

        const lower = actualStatus.toLowerCase();
        const color =
          lower === "active"
            ? "#10a400ff"
            : lower === "inactive"
            ? "#ff0000"
            : "default";
        return <Tag color={color}>{actualStatus.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (record: PromotionInterface) => {
        const creatorId = record.user_id;
        const currentUserId = user?.id;
        const isOwner =
          creatorId !== undefined &&
          currentUserId !== undefined &&
          String(creatorId) === String(currentUserId);

        if (!isOwner) return null; // ไม่ใช่เจ้าของ → ไม่แสดงอะไรเลย

        return (
          <Space size="middle">
            <FaEdit
              style={{ fontSize: 20, color: "#0048ffff", cursor: "pointer" }}
              onClick={() =>
                (record as any).ID !== undefined &&
                handleEdit((record as any).ID)
              }
            />
            <RiDeleteBin6Line
              style={{ fontSize: 20, color: "#ff0000ff", cursor: "pointer" }}
              onClick={() =>
                (record as any).ID !== undefined &&
                (record as any).promotion_name &&
                handleDelete((record as any).ID, (record as any).promotion_name)
              }
            />
          </Space>
        );
      },
    },
  ];
  [user?.id]

  const handleEdit = (id: number) => {
    setSelectedPromotionId(id);
    setEditModalVisible(true);
  };

  const handleDelete = (id: number, promotion_name: string) => {
    confirm({
      title: `คุณต้องการลบโปรโมชั่น "${promotion_name}" ใช่หรือไม่?`,
      icon: <ExclamationCircleOutlined />,
      content: "การลบโปรโมชั่นนี้ไม่สามารถกู้คืนได้",
      centered: true,
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      async onOk() {
        try {
          setLoading(true);
          const res = await promotionAPI.delete(id);
          if (res && res.status === 200) {
            message.success("ลบโปรโมชั่นสำเร็จ");
            fetchPromotions(); // รีโหลดข้อมูล
          } else {
            message.error("ลบโปรโมชั่นไม่สำเร็จ");
          }
        } catch (error) {
          console.error("Delete error:", error);
          message.error("เกิดข้อผิดพลาดในการลบ");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleEditSuccess = () => {
    fetchPromotions(); // รีโหลดข้อมูลหลัง edit สำเร็จ
    setEditModalVisible(false);
  };

  return (
    <>
      <SidebarLayout>
        <div style={{ display: "flex", alignContent: "center" }}>
          <h1>Promotion Management</h1>
          <Link to={"/organizer/promotion/add"}>
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
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            Search
          </Button>
        </Flex>

        <Table<PromotionInterface>
          columns={columns}
          dataSource={promotions}
          loading={loading}
          style={{ marginTop: 20, width: "auto" }}
          rowKey="ID"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} ของ ${total} รายการ`,
          }}
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
