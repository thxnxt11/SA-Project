import React, { useEffect, useState } from "react";
import AdminsidebarLayout from "../../components/sidebarLayout";
import {
  Button,
  Card,
  Col,
  Input,
  Popconfirm,
  Row,
  Tag,
  Typography,
  message,
  Spin,
  Result,
  Modal,
} from "antd";
import {
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { FaBuilding } from "react-icons/fa6";
import { PiMicrophoneStageFill } from "react-icons/pi";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { venueAPI } from "../../services/https/index";
import type { VenueInterface } from "../../interfaces/venue";

const { Text } = Typography;

const Venue: React.FC = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<VenueInterface[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // modal state
  const [deleteStatus, setDeleteStatus] = useState<"success" | "error" | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch venues
  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await venueAPI.getAll();
      if (res?.data) setVenues(res.data);
    } catch (error) {
      console.error(error);
      message.error("ไม่สามารถโหลดข้อมูลสถานที่ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  // Delete venue
  const handleDelete = async (id: number) => {
    try {
      const res = await venueAPI.delete(id);
      if (res?.status === 200) {
        setDeleteStatus("success");
        fetchVenues();
      } else {
        setDeleteStatus("error");
      }
    } catch (err) {
      console.error(err);
      setDeleteStatus("error");
    } finally {
      setModalVisible(true); // เปิด modal ทุกครั้งหลังลบ
    }
  };

  // Filter by search
  const filteredVenues = venues.filter(
    (v) =>
      v.venue_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminsidebarLayout>
      <div style={{ padding: "20px" }}>
        <h1 style={{ fontWeight: "bold", marginBottom: 4 }}>
          Venue and Stage Management
        </h1>
        <Text type="secondary">Manage concert venues and stages</Text>

        <div style={{ display: "flex", margin: "15px 0" }}>
          <Input
            placeholder="Search for a place or location"
            style={{ width: 400, marginRight: 10, borderRadius: 8 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            type="primary"
            style={{ borderRadius: 8 }}
            onClick={() => navigate("/addvenue")}
          >
            + Add Venue
          </Button>
        </div>

        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 50 }}
          >
            <Spin size="large" />
          </div>
        ) : filteredVenues.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 50, color: "#888" }}>
            ไม่มีสถานที่
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredVenues.map((venue) => (
              <Col
                key={venue.ID}
                xs={24}
                sm={12}
                md={8}
                lg={6}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Card
                  hoverable
                  title={
                    <strong
                      style={{
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {venue.venue_name || "-"}
                    </strong>
                  }
                  bordered
                  style={{
                    borderRadius: 10,
                    backgroundColor: "#fff",
                    width: "100%",
                    maxWidth: 300,
                    border: "2px solid #ccc",
                    padding: 8,
                  }}
                >
                  <p>
                    <EnvironmentOutlined /> {venue.location || "-"}
                  </p>
                  <p>
                    <TeamOutlined /> ความจุ: {venue.venue_capacity || "-"} คน
                  </p>
                  <p>
                    <FaBuilding /> ประเภท: {venue.venue_type?.venue_type || "-"}
                  </p>
                  <p>
                    <CalendarOutlined /> เวที: {venue.stages?.length || 0} เวที
                  </p>
                  <p>
                    <PiMicrophoneStageFill /> เวทีในสถานที่:{" "}
                    {venue.stages?.map((s) => (
                      <Tag key={s.id}>
                        name: {s.stage_name} Type:{" "}
                        {s.stage_type?.stage_type || "-"}
                      </Tag>
                    )) || "-"}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 16,
                    }}
                  >
                    <Button
                      type="primary"
                      icon={<FaRegEdit />}
                      onClick={() =>
                        navigate("/editvenue", { state: { venue } })
                      }
                    >
                      Edit
                    </Button>

                    <Popconfirm
                      title="Are you sure to delete this venue?"
                      onConfirm={() => handleDelete(venue.ID)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button danger icon={<RiDeleteBin6Line />}>
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Modal สำหรับแจ้งผลการลบ */}
        <Modal
          open={modalVisible}
          footer={null}
          onCancel={() => setModalVisible(false)}
          centered
        >
          {deleteStatus === "success" ? (
            <Result
              status="success"
              title="ลบสถานที่เรียบร้อยแล้ว"
              extra={[
                <Button
                  type="primary"
                  onClick={() => setModalVisible(false)}
                  key="ok"
                >
                  ตกลง
                </Button>,
              ]}
            />
          ) : deleteStatus === "error" ? (
            <Result
              status="error"
              title="ลบสถานที่ไม่สำเร็จ"
              subTitle="กรุณาลองใหม่อีกครั้ง"
              extra={[
                <Button
                  type="primary"
                  onClick={() => setModalVisible(false)}
                  key="close"
                >
                  ปิด
                </Button>,
              ]}
            />
          ) : null}
        </Modal>
      </div>
    </AdminsidebarLayout>
  );
};

export default Venue;
