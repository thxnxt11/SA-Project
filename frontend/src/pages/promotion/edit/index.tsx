import { useState, useEffect } from "react";
import {
  Modal,
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
  Divider,
  Spin,
  Upload,
  type UploadFile,
  type UploadProps,
} from "antd";
import dayjs from "dayjs";
import {
  GetAllConcerts,
  GetAllPromotionTypes,
  GetPromotionByID,
  UpdatePromotionByID,
} from "../../../services/https";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

interface EditPromotionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  promotionId: number | null;
}

interface ConcertInterface {
  id: number;
  concert_name: string;
}

interface PromotionTypeInterface {
  id: number;
  promotion_type: string;
}

const EditPromotionModal: React.FC<EditPromotionModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  promotionId,
}) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [promotion, setPromotion] = useState<any>(null);
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [promotionTypes, setPromotionTypes] = useState<
    PromotionTypeInterface[]
  >([]);
  const [fetching, setFetching] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `HTTP error! Status: ${response.status}, Response: ${errorText}`
        );
        messageApi.error(
          `อัปโหลดรูปภาพไม่สำเร็จ: ${response.status} ${response.statusText}`
        );
        return false;
      }

      const result = await response.json();

      if (result.success) {
        const uploadedUrl = result.data.url;
        setPosterUrl(uploadedUrl); // Update the state holding the URL
        form.setFieldsValue({ poster_url: uploadedUrl }); // Update form field for validation
        messageApi.success("อัปโหลดรูปภาพสำเร็จ!");
        return true; // Indicate success
      } else {
        messageApi.error(result.error || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        return false; // Indicate failure
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      console.error("Upload error:", error);
      return false; // Indicate failure
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

  useEffect(() => {
    const fetchData = async () => {
      if (visible && promotionId) {
        setFetching(true);
        try {
          const [promotionRes, concertsRes, typesRes] = await Promise.all([
            GetPromotionByID(promotionId),
            GetAllConcerts(),
            GetAllPromotionTypes(),
          ]);

          console.log("API Responses:", {
            promotion: promotionRes,
            concerts: concertsRes,
            types: typesRes,
          });

          // แก้ไข: ข้อมูลอยู่ใน .data.data
          const promotionData = promotionRes.data?.data || promotionRes.data;
          const concertsData = concertsRes.data?.data || concertsRes.data;
          const typesData = typesRes.data?.data || typesRes.data;

          console.log("Extracted data:", {
            promotionData,
            concertsData,
            typesData,
          });

          setConcerts(concertsData || []);
          setPromotionTypes(typesData || []);

          if (promotionData) {
            setPromotion(promotionData);
            // ตั้งค่า selectedType
            setSelectedType(promotionData.promotion_type_id);
            if (promotionData.poster_url) {
              setPosterUrl(promotionData.poster_url);
              setFileList([
                {
                  uid: "-1", // Unique ID for the file
                  name: "poster.png", // Placeholder name
                  status: "done", // Mark as uploaded
                  url: promotionData.poster_url, // The actual URL
                  thumbUrl: promotionData.poster_url, // For thumbnail display
                },
              ]);
              // Set form field value for validation, though not strictly needed for display
              form.setFieldsValue({ poster_url: promotionData.poster_url });
            } else {
              setPosterUrl(null);
              setFileList([]);
              form.setFieldsValue({ poster_url: undefined });
            }

            const formValues = {
              promotion_name: promotionData.promotion_name || "",
              promotion_type: promotionData.promotion_type_id || undefined,
              discount: promotionData.discount || 0,
              start_date: promotionData.start_date
                ? dayjs(promotionData.start_date)
                : null,
              end_date: promotionData.end_date
                ? dayjs(promotionData.end_date)
                : null,
              limit: promotionData.limit || "",
              promotion_status: promotionData.promotion_status || "",
              description: promotionData.promotion_description || "",
              promotion_code: promotionData.promotion_code || "",
              concert: promotionData.concert_id || undefined,
            };

            console.log("Setting form values:", formValues);

            // ใช้ setTimeout เพื่อให้แน่ใจว่าฟอร์มพร้อมรับค่า
            setTimeout(() => {
              form.setFieldsValue(formValues);
              console.log("Form values set successfully");
            }, 100);
          }
        } catch (error) {
          messageApi.error("Failed to fetch data");
          console.error("Fetch error:", error);
        } finally {
          setFetching(false);
        }
      }
    };

    fetchData();
  }, [visible, promotionId, form, messageApi]);

  const handlePromotionTypeChange = (value: number) => {
    setSelectedType(value);
    form.setFieldsValue({ concert: undefined, promotion_code: undefined });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (promotionId) {
        const payload = {
          promotion_name: values.promotion_name,
          promotion_description: values.description,
          promotion_type_id: values.promotion_type,
          promotion_code: values.promotion_code || "",
          discount: values.discount,
          limit: parseInt(values.limit),
          start_date: values.start_date.toISOString(),
          end_date: values.end_date.toISOString(),
          promotion_status: values.promotion_status,
          concert_id: values.promotion_type === 3 ? values.concert : null,
          poster_url: posterUrl,
        };

        console.log("Submitting payload:", payload);
        const res = await UpdatePromotionByID(promotionId, payload);

        if (res.status === 200) {
          messageApi.success("อัปเดตโปรโมชั่นสำเร็จ!");
          onSuccess();
          handleCancel();
        } else {
          messageApi.error(res.data?.error || "อัปเดตโปรโมชั่นไม่สำเร็จ");
        }
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    if (promotion) {
      const formValues = {
        promotion_name: promotion.promotion_name || "",
        promotion_type: promotion.promotion_type_id || undefined,
        discount: promotion.discount || 0,
        start_date: promotion.start_date ? dayjs(promotion.start_date) : null,
        end_date: promotion.end_date ? dayjs(promotion.end_date) : null,
        limit: promotion.limit || "",
        promotion_status: promotion.promotion_status || "",
        description: promotion.promotion_description || "",
        promotion_code: promotion.promotion_code || "",
        concert: promotion.concert_id || undefined,
      };

      form.setFieldsValue(formValues);
      setSelectedType(promotion.promotion_type_id || null);
      if (promotion.poster_url) {
        setPosterUrl(promotion.poster_url);
        setFileList([
          {
            uid: "-1",
            name: "poster.png",
            status: "done",
            url: promotion.poster_url,
            thumbUrl: promotion.poster_url,
          },
        ]);
        form.setFieldsValue({ poster_url: promotion.poster_url });
      } else {
        setPosterUrl(null);
        setFileList([]);
        form.setFieldsValue({ poster_url: undefined });
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedType(null);
    setPosterUrl(null);
    setFileList([]);
    onCancel();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={<h2 style={{ textAlign: "center" }}>Edit Promotion</h2>}
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Divider style={{ borderColor: "#d3d3d3ff" }} />

        {fetching ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ maxWidth: 900, margin: "20px auto" }}
            autoComplete="off"
          >
            <Row gutter={[50, 0]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  name="promotion_name"
                  label="Promotion Name"
                  rules={[{ required: true }]}
                >
                  <Input style={{ width: "100%" }} />
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
                    style={{ width: "100%" }}
                  >
                    {promotionTypes.map((type) => (
                      <Option key={`type-${type.id}`} value={type.id}>
                        {type.promotion_type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {selectedType === 2 && (
              <Row gutter={[50, 0]}>
                <Col span={24}>
                  <Form.Item
                    name="promotion_code"
                    label="Discount Code"
                    rules={[{ required: true, message: "Please enter a code" }]}
                  >
                    <Input
                      placeholder="Enter your code"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {selectedType === 3 && (
              <Row gutter={[50, 0]}>
                <Col span={24}>
                  <Form.Item
                    name="concert"
                    label="Concert"
                    rules={[
                      { required: true, message: "Please select a concert" },
                    ]}
                  >
                    <Select
                      placeholder="Select a Concert"
                      style={{ width: "100%" }}
                      allowClear
                    >
                      {concerts.map((concert) => (
                        <Option
                          key={`concert-${concert.id}`}
                          value={concert.id}
                        >
                          {concert.concert_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Row gutter={[50, 0]}>
              <Col span={12}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea
                    showCount
                    maxLength={255}
                    placeholder="description"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  name="poster_url" // This field will hold the URL
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
                  rules={[{ required: true }]}
                >
                  <InputNumber<number>
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) =>
                      value?.replace("%", "") as unknown as number
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  name="limit"
                  label="Usage Limit"
                  rules={[{ required: true }]}
                >
                  <Input style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[50, 0]}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  name="start_date"
                  label="Start Date"
                  rules={[{ required: true }]}
                >
                  <DatePicker
                    showTime={{ format: "HH:mm:ss" }}
                    format="YYYY-MM-DD HH:mm:ss"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Form.Item
                  name="end_date"
                  label="End Date"
                  rules={[
                    { required: true },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          !value ||
                          value.isAfter(getFieldValue("start_date"))
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          "End date must be after start date"
                        );
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    showTime={{ format: "HH:mm:ss" }}
                    format="YYYY-MM-DD HH:mm:ss"
                    style={{ width: "100%" }}
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
                  <Select style={{ width: "100%" }}>
                    <Option value="inactive">Inactive</Option>
                    <Option value="active">Active</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row justify="center" style={{ marginTop: 30 }}>
              <Space>
                <Button htmlType="button" onClick={onReset}>
                  Reset
                </Button>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update
                </Button>
              </Space>
            </Row>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default EditPromotionModal;
