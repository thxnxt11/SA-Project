import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import SidebarLayout from "../../../component/layout/SidebarLayout";
import {
  Card,
  Divider,
  Form,
  Button,
  Input,
  Select,
  Space,
  Row,
  Col,
  InputNumber,
  DatePicker,
  message,
  Upload,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import { promotionAPI, concertAPI, uploadAPI } from "../../../services/https";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hook/authContext";

const { Option } = Select;

const AddPromotion: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [promotionTypes, setPromotionTypes] = useState<any[]>([]);
  const [concerts, setConcerts] = useState<any[]>([]);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const onGetInitialData = async () => {
    try {
      const [typesRes, concertsRes] = await Promise.all([
        promotionAPI.getAllTypes(),
        concertAPI.getAll(),
      ]);
      if (typesRes.status === 200 && concertsRes.status === 200) {
        setPromotionTypes(typesRes.data);
        setConcerts(concertsRes.data);
        setApiLoaded(true);
      } else {
        messageApi.open({
          type: "error",
          content: "ไม่สามารถดึงข้อมูลเริ่มต้นได้",
        });
        setTimeout(() => {
          navigate("/organizer/promotion");
        }, 2000);
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
      console.error("Fetch error:", error);
      setTimeout(() => {
        navigate("/organizer/promotion");
      }, 2000);
    }
  };

  const handlePromotionTypeChange = (value: number) => {
    setSelectedType(value);
    form.setFieldsValue({ concert: undefined, code: undefined }); // reset fields
  };

const handleFileUpload = async (file: File) => {
  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);

    // ✅ เรียกผ่าน service
    const res = await uploadAPI.upload(formData);
    const data = res?.data;

    // รองรับทั้งสองรูปแบบ response: { success, data:{url} } หรือ { url }
    const success = data?.success ?? Boolean(data?.data?.url || data?.url);
    const uploadedUrl = data?.data?.url ?? data?.url ?? "";

    if (success && uploadedUrl) {
      setPosterUrl(uploadedUrl);
      form.setFieldsValue({ poster_url: uploadedUrl });
      messageApi.success("อัปโหลดรูปภาพสำเร็จ!");
      return true;
    }

    messageApi.error(data?.error || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    return false;
  } catch (err: any) {
    if (err.response) {
      messageApi.error(
        `อัปโหลดรูปภาพไม่สำเร็จ: ${err.response?.status ?? ""} ${
          err.response?.statusText ?? ""
        }`
      );
      console.error("Upload error:", err.response?.data || err.message);
    } else {
      messageApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      console.error("Upload error:", err);
    }
    return false;
  } finally {
    setLoading(false);
  }
};


  // Ant Design Upload onChange handler
  const handleAntdUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
    // If the file list becomes empty (e.g., user removes the file), clear the posterUrl
    if (newFileList.length === 0) {
      setPosterUrl(null);
      form.setFieldsValue({ poster_url: undefined }); // Clear form field as well
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        promotion_name: values.promotion_name,
        promotion_description: values.description,
        promotion_type_id: values.promotion_type,
        promotion_code: values.promotion_code,
        discount: values.discount,
        limit: parseInt(values.limit),
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        promotion_status: values.promotion_status,
        concert_id: values.promotion_type === 3 ? values.concert : null,
        poster_url: posterUrl,
        user_id:
          typeof user?.id === "string" ? parseInt(user.id, 10) : user?.id,
      };
      console.log("Form values:", values);
      console.log("Payload:", payload);

      let res = await promotionAPI.create(payload);

      if (res.status === 201) {
        messageApi.open({
          type: "success",
          content: res.data.message || "สร้างโปรโมชั่นสำเร็จ!",
        });
        setTimeout(() => {
          navigate("/organizer/promotion");
        }, 2000);
      } else {
        messageApi.open({
          type: "error",
          content: res.data.error || "สร้างโปรโมชั่นไม่สำเร็จ",
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setSelectedType(null);

    setFileList([]);
    setPosterUrl(null);
    form.setFieldsValue({ poster_url: undefined });
  };

  useEffect(() => {
    onGetInitialData();
    return () => {};
  }, []);

  return (
    <>
      {contextHolder}
      <SidebarLayout>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Card
            style={{
              width: 900,
              height: 700,
              borderColor: "#d3d3d3ff",
              display: "flex",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h2 style={{ display: "flex", justifyContent: "center" }}>
              Create New Promotion
            </h2>
            <Divider style={{ borderColor: "#d3d3d3ff" }} />
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
                autoComplete="off"
              >
                <Row gutter={[50, 0]}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="promotion_name"
                      label="Promotion Name"
                      rules={[{ required: true }]}
                    >
                      <Input style={{ width: 300 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="promotion_type"
                      label="Promotion Type"
                      rules={[{ required: true }]}
                    >
                      <Select
                        placeholder="Select a promotion type"
                        onChange={handlePromotionTypeChange}
                        allowClear
                        style={{ width: 300 }}
                        disabled={!apiLoaded}
                      >
                        {promotionTypes.map((type) => (
                          <Option key={type.id} value={type.id}>
                            {type.promotion_type}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[50, 0]}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="promotion_code"
                      label="Discount Code"
                      rules={
                        selectedType === 2
                          ? [
                              {
                                required: true,
                                message: "Please enter a code",
                              },
                            ]
                          : []
                      }
                    >
                      <Input
                        placeholder="Enter your code"
                        style={{ width: 300 }}
                      />
                    </Form.Item>
                  </Col>

                  {selectedType === 3 && (
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                      <Form.Item
                        name="concert"
                        label="Concert"
                        rules={
                          selectedType === 3
                            ? [
                                {
                                  required: true,
                                  message: "Please select a concert",
                                },
                              ]
                            : []
                        }
                      >
                        <Select
                          placeholder="Select a Concert"
                          style={{ width: 300 }}
                          allowClear
                        >
                          {concerts.map((concert) => (
                            <Option key={concert.ID} value={concert.ID}>
                              {concert.concert_name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  )}
                </Row>
                <Row gutter={[50, 0]}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[
                        {
                          required: true,
                          message: "Please enter description!",
                        },
                      ]}
                    >
                      <Input.TextArea
                        showCount
                        maxLength={255}
                        placeholder="description"
                        style={{ width: 300 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="poster_url"
                      label="Poster"
                      rules={[
                        {
                          required: true,
                          message: "Please upload a poster image!",
                        },
                      ]}
                    >
                      <Upload
                        listType="picture-card"
                        maxCount={1} // Allow only one file
                        fileList={fileList}
                        beforeUpload={(file) => {
                          // Prevent Ant Design's default upload behavior
                          // and call our custom upload function
                          handleFileUpload(file);
                          return false;
                        }}
                        onChange={handleAntdUploadChange}
                      >
                        {fileList.length < 1 && (
                          <button
                            style={{
                              color: "inherit",
                              cursor: "inherit",
                              border: 0,
                              background: "none",
                            }}
                            type="button"
                          >
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </button>
                        )}
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[50, 0]}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="discount"
                      label="Discount(%)"
                      rules={[
                        {
                          required: true,
                          message: "Please enter discount percentage!",
                        },
                      ]}
                    >
                      <InputNumber<number>
                        defaultValue={0}
                        min={0}
                        max={100}
                        formatter={(value) => `${value}%`}
                        parser={(value) =>
                          value?.replace("%", "") as unknown as number
                        }
                        style={{ width: 300 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="limit"
                      label="Usage Limit"
                      rules={[
                        {
                          required: true,
                          message: "Please enter usage limit!",
                        },
                      ]}
                    >
                      <Input style={{ width: 300 }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[50, 0]}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="start_date"
                      label="Start Date"
                      rules={[
                        {
                          required: true,
                          message: "Please select start date!",
                        },
                      ]}
                    >
                      <DatePicker
                        showTime={{ format: "HH:mm:ss" }}
                        format="YYYY-MM-DD HH:mm:ss"
                        style={{ width: 300 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="end_date"
                      label="End Date"
                      rules={[
                        { required: true, message: "Please select end date!" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const startDate = getFieldValue("start_date");
                            if (
                              !startDate ||
                              !value ||
                              value.isAfter(startDate)
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("End date must be after start date!")
                            );
                          },
                        }),
                      ]}
                    >
                      <DatePicker
                        showTime={{ format: "HH:mm:ss" }}
                        format="YYYY-MM-DD HH:mm:ss"
                        style={{ width: 300 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[50, 0]}>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item
                      name="promotion_status"
                      label="Status"
                      rules={[{ required: true }]}
                    >
                      <Select allowClear style={{ width: 300 }}>
                        <Option value="Inactive">Inactive</Option>
                        <Option value="Active">Active</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col style={{ marginTop: 31, marginLeft: 120 }}>
                    <Form.Item>
                      <Space>
                        <Button htmlType="button" onClick={onReset}>
                          Reset
                        </Button>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                        >
                          Submit
                        </Button>
                      </Space>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </Card>
        </div>
      </SidebarLayout>
    </>
  );
};

export default AddPromotion;
