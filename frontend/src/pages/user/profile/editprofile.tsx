import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  DatePicker,
  Select,
  Row,
  Col,
  Divider,
  Tooltip,
  Skeleton,
  Avatar,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import Navbar from "../../../component/layout/navbar";
import { useAuth } from "../../../hook/authContext";
import { userApi } from "../../../services/https";

const { Title, Text } = Typography;

type FormValues = {
  firstname: string;
  lastname: string;
  phonenum: string;
  birthday: Dayjs | null;
  age?: number;
  gender_id?: number;
};

type Gender = { id: number; name: string };

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 860,
  borderRadius: 18,
  overflow: "hidden",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
};

const headerWrap: React.CSSProperties = {
  background: "linear-gradient(135deg, #001a4d 0%, #00306e 50%, #004a8f 100%)",
  padding: "28px 28px 16px 28px",
  color: "#fff",
};

const footerBar: React.CSSProperties = {
  position: "sticky",
  bottom: 0,
  background: "#fff",
  borderTop: "1px solid #f0f0f0",
  padding: 16,
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  zIndex: 1,
};

const EditProfile: React.FC = () => {
  const { user, updateUserInContext } = useAuth() as any;
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [originalData, setOriginalData] = useState<FormValues | null>(null);
  const userName = useMemo(
    () =>
      user?.name || [user?.firstname, user?.lastname].filter(Boolean).join(" "),
    [user]
  );

  // โหลดรายการ Gender
  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const res = await userApi.getAllGender();
        const items: Gender[] = (res.data ?? []).map((g: any) => ({
          id: g.ID ?? g.id,
          name: g.gender ?? g.name,
        }));
        setGenders(items);
      } catch (e) {
        console.error(e);
        message.warning("โหลดรายการเพศไม่สำเร็จ");
      }
    };
    fetchGenders();
  }, []);

  // โหลดข้อมูลผู้ใช้ตาม id แล้ว map -> ค่าในฟอร์ม
  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const res = await userApi.getById(user.id);
        const data = res.data;

        const mapped: FormValues = {
          firstname: data.first_name,
          lastname: data.last_name,
          phonenum: data.phone_number,
          age: data.age,
          birthday: data.birthday ? dayjs(data.birthday) : null,
          gender_id: data.gender_id,
        };

        form.setFieldsValue(mapped);
        setOriginalData(mapped);
      } catch (err: any) {
        console.error(err);
        message.error("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user?.id, form]);

  const onFinish = async (values: FormValues) => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      const payload = {
        first_name: values.firstname.trim(),
        last_name: values.lastname.trim(),
        phone_number: values.phonenum.trim(),
        birthday: values.birthday
          ? values.birthday.toDate().toISOString()
          : null,
        gender_id: values.gender_id,
      };

      const res = await userApi.updateById(user.id, payload);
      if (res.status === 200) {
        message.success("อัปเดตข้อมูลสำเร็จ");
        if (typeof updateUserInContext === "function") {
          updateUserInContext({
            firstname: payload.first_name,
            lastname: payload.last_name,
            phonenum: payload.phone_number,
            name: [payload.first_name, payload.last_name]
              .filter(Boolean)
              .join(" "),
          });
        }
      } else {
        message.error("อัปเดตข้อมูลไม่สำเร็จ");
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "เกิดข้อผิดพลาดในการอัปเดตข้อมูล";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
          <Card style={cardStyle}>
            <div style={{ padding: 28 }}>
              <Title level={4} style={{ marginBottom: 0 }}>
                ไม่พบข้อมูลผู้ใช้งาน
              </Title>
              <Text type="secondary">กรุณาเข้าสู่ระบบใหม่อีกครั้ง</Text>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
        <Card style={cardStyle} bodyStyle={{ padding: 0 }}>
          {/* Header */}
          <div style={headerWrap}>
            <Col>
              <Space size={24} align="center">
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    color: "white",
                    fontSize: 32,
                    border: "3px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                  }}
                />
                <div>
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      color: "white",
                      fontSize: 28,
                      fontWeight: 700,
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {userName}
                  </Title>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "rgba(255, 255, 255, 0.8)",
                      fontWeight: 500,
                    }}
                  >
                    {user?.email}
                  </Text>
                </div>
              </Space>
            </Col>
          </div>

          <Divider style={{ margin: 0 }} />

          {/* Body */}
          <div style={{ padding: 24 }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark="optional"
                style={{ maxWidth: 820, margin: "0 auto" }}
              >
                {/* ชื่อ-นามสกุล */}
                <Row gutter={[16, 8]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Firstname"
                      name="firstname"
                      rules={[
                        { required: true, message: "กรอกชื่อ" },
                        { min: 2, message: "อย่างน้อย 2 ตัวอักษร" },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Firstname"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Lastname"
                      name="lastname"
                      rules={[
                        { required: true, message: "กรอกนามสกุล" },
                        { min: 2, message: "อย่างน้อย 2 ตัวอักษร" },
                      ]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Lastname" />
                    </Form.Item>
                  </Col>
                </Row>

                {/* เบอร์ - วันเกิด */}
                <Row gutter={[16, 8]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label={
                        <Space size={4}>
                          Tel
                          <Tooltip title="กรอกเฉพาะตัวเลข 10 หลัก">
                            <InfoCircleOutlined style={{ color: "#999" }} />
                          </Tooltip>
                        </Space>
                      }
                      name="phonenum"
                      rules={[
                        { required: true, message: "กรอกเบอร์โทรศัพท์" },
                        {
                          pattern: /^\d{10}$/,
                          message: "รูปแบบไม่ถูกต้อง (10 หลัก)",
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="PhoneNumber"
                        maxLength={12}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Birthday"
                      name="birthday"
                      rules={[{ required: true, message: "เลือกวันเกิด" }]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD"
                        placeholder="เลือกวัน/เดือน/ปี"
                        suffixIcon={<CalendarOutlined />}
                        disabledDate={(d) => d && d > dayjs()}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* เพศ - อายุ (optional) */}
                <Row gutter={[16, 8]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Gender"
                      name="gender_id"
                      rules={[{ required: true, message: "เลือกเพศ" }]}
                    >
                      <Select
                        placeholder="Select gender"
                        options={genders.map((g) => ({
                          label: (
                            <Space>
                              {g.name?.toLowerCase() === "male" && (
                                <ManOutlined />
                              )}
                              {g.name?.toLowerCase() === "female" && (
                                <WomanOutlined />
                              )}
                              <span>{g.name}</span>
                            </Space>
                          ),
                          value: g.id,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Age" name="age">
                      <Input placeholder="Age" type="number" min={0} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )}
          </div>

          {/* Footer actions (sticky) */}
          {!loading && (
            <div style={footerBar}>
              <Space>
                <Button
                  onClick={() =>
                    originalData && form.setFieldsValue(originalData)
                  }
                >
                  Reset
                </Button>
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  loading={submitting}
                >
                  Save
                </Button>
              </Space>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default EditProfile;
