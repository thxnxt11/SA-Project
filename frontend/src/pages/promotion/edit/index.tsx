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
import { concertAPI, promotionAPI } from "../../../services/https";
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
  const [messageApi, contextHolder] = message.useMessage();
  const [fetching, setFetching] = useState(false); // โหลดข้อมูลแรกเข้า modal
  const [loading, setLoading] = useState(false); // submit / upload
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [promotion, setPromotion] = useState<any>(null);
  const [concerts, setConcerts] = useState<ConcertInterface[]>([]);
  const [promotionTypes, setPromotionTypes] = useState<
    PromotionTypeInterface[]
  >([]);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const setPosterToForm = (url: string | null) => {
    setPosterUrl(url);
    form.setFieldsValue({ poster_url: url ?? undefined });
  };

  const setPosterPreview = (absoluteUrl: string | null) => {
    if (!absoluteUrl) {
      setFileList([]);
      return;
    }
    setFileList([
      {
        uid: "-1",
        name: "poster.png",
        status: "done",
        url: absoluteUrl,
        thumbUrl: absoluteUrl,
      },
    ]);
  };

  const mapInitialFormValues = (p: any) => ({
    promotion_name: p?.promotion_name ?? "",
    promotion_type: p?.promotion_type_id ?? undefined,
    discount: p?.discount ?? 0,
    start_date: p?.start_date ? dayjs(p.start_date) : null,
    end_date: p?.end_date ? dayjs(p.end_date) : null,
    limit: p?.limit ?? "",
    promotion_status: p?.promotion_status ?? "",
    description: p?.promotion_description ?? "",
    promotion_code: p?.promotion_code ?? "",
    concert: p?.concert_id ?? undefined,
  });

  /* ---------------- Effects: fetch initial data ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      if (!visible || !promotionId) return;

      setFetching(true);
      try {
        const [promotionRes, concertsRes, typesRes] = await Promise.all([
          promotionAPI.getById(promotionId),
          concertAPI.getAll(),
          promotionAPI.getAllTypes(),
        ]);

        const promotionData = promotionRes.data?.data ?? promotionRes.data;
        const concertsData = concertsRes.data?.data ?? concertsRes.data;
        const typesData = typesRes.data?.data ?? typesRes.data;

        setConcerts(concertsData ?? []);
        setPromotionTypes(typesData ?? []);

        if (promotionData) {
          setPromotion(promotionData);
          setSelectedType(promotionData.promotion_type_id ?? null);

          // โปสเตอร์
          if (promotionData.poster_url) {
            const absolute = `http://localhost:8000${promotionData.poster_url}`;
            setPosterToForm(promotionData.poster_url);
            setPosterPreview(absolute);
          } else {
            setPosterToForm(null);
            setPosterPreview(null);
          }

          // ฟอร์ม
          const values = mapInitialFormValues(promotionData);
          setTimeout(() => form.setFieldsValue(values), 0);
        }
      } catch (error) {
        messageApi.error("Failed to fetch data");
        console.error("Fetch error:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [visible, promotionId]);

  /* ---------------- Handlers ---------------- */
  const handlePromotionTypeChange = (value: number) => {
    setSelectedType(value);
    form.setFieldsValue({ concert: undefined, promotion_code: undefined });
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const raw = await res.text();
        console.error(`Upload error ${res.status}: ${raw}`);
        messageApi.error(
          `อัปโหลดรูปภาพไม่สำเร็จ: ${res.status} ${res.statusText}`
        );
        return false;
      }

      const result = await res.json();
      if (!result?.success) {
        messageApi.error(result?.error || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        return false;
      }

      const uploadedUrl: string = result.data.url; // path บนเซิร์ฟเวอร์ (ไม่ใช่ absolute)
      setPosterToForm(uploadedUrl);
      setPosterPreview(`http://localhost:8000${uploadedUrl}`);
      messageApi.success("อัปโหลดรูปภาพสำเร็จ!");
      return true;
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      console.error("Upload error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange: UploadProps["onChange"] = ({ fileList: next }) => {
    setFileList(next);
    if (next.length === 0) setPosterToForm(null);
  };

  const onFinish = async (v: any) => {
    setLoading(true);
    try {
      if (!promotionId) return;

      const payload = {
        promotion_name: v.promotion_name,
        promotion_description: v.description,
        promotion_type_id: v.promotion_type,
        promotion_code: v.promotion_code || "",
        discount: v.discount,
        limit: parseInt(v.limit),
        start_date: v.start_date.toISOString(),
        end_date: v.end_date.toISOString(),
        promotion_status: v.promotion_status,
        concert_id: v.promotion_type === 3 ? v.concert : null,
        poster_url: posterUrl, // path (เช่น /uploads/xxx.png)
      };

      const res = await promotionAPI.update(promotionId, payload);
      if (res.status === 200) {
        messageApi.success("อัปเดตโปรโมชั่นสำเร็จ!");
        onSuccess();
        handleCancel();
      } else {
        messageApi.error(res.data?.error || "อัปเดตโปรโมชั่นไม่สำเร็จ");
      }
    } catch (error) {
      messageApi.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    if (!promotion) return;

    form.setFieldsValue(mapInitialFormValues(promotion));
    setSelectedType(promotion.promotion_type_id ?? null);

    if (promotion.poster_url) {
      const absolute = `http://localhost:8000${promotion.poster_url}`;
      setPosterToForm(promotion.poster_url);
      setPosterPreview(absolute);
    } else {
      setPosterToForm(null);
      setPosterPreview(null);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedType(null);
    setPosterToForm(null);
    setPosterPreview(null);
    onCancel();
  };

  /* ---------------- Render ---------------- */
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
          <div style={{ textAlign: "center", padding: 50 }}>
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
            {/* Row 1: Name & Type */}
            <Row gutter={[50, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="promotion_name"
                  label="Promotion Name"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="promotion_type"
                  label="Promotion Type"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select a promotion type"
                    onChange={handlePromotionTypeChange}
                  >
                    {promotionTypes.map((t) => (
                      <Option key={`type-${t.id}`} value={t.id}>
                        {t.promotion_type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

              <Row gutter={[50, 0]}>
                <Col span={24}>
                  <Form.Item
                    name="promotion_code"
                    label="Discount Code"
                    rules={[{ required: true, message: "Please enter a code" }]}
                  >
                    <Input placeholder="Enter your code" />
                  </Form.Item>
                </Col>
              </Row>
            
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
                    <Select placeholder="Select a Concert" allowClear>
                      {concerts.map((c) => (
                        <Option key={`concert-${c.id}`} value={c.id}>
                          {c.concert_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* Row 3: Description & Poster */}
            <Row gutter={[50, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea
                    showCount
                    maxLength={255}
                    placeholder="description"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
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
                    maxCount={1}
                    fileList={fileList}
                    beforeUpload={(file) => {
                      // ใช้ upload เองเสมอ
                      handleFileUpload(file);
                      return false;
                    }}
                    onChange={handleUploadChange}
                    onRemove={() => {
                      setPosterToForm(null);
                      return true;
                    }}
                  >
                    {fileList.length < 1 && (
                      <button
                        type="button"
                        style={{
                          color: "inherit",
                          cursor: "inherit",
                          border: 0,
                          background: "none",
                        }}
                      >
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </button>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            {/* Row 4: Discount & Limit */}
            <Row gutter={[50, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="discount"
                  label="Discount(%)"
                  rules={[{ required: true }]}
                >
                  <InputNumber<number>
                    min={0}
                    max={100}
                    formatter={(v) => `${v}%`}
                    parser={(v) => v?.replace("%", "") as unknown as number}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="limit"
                  label="Usage Limit"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* Row 5: Dates */}
            <Row gutter={[50, 0]}>
              <Col xs={24} md={12}>
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
              <Col xs={24} md={12}>
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

            {/* Row 6: Status */}
            <Row gutter={[50, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="promotion_status"
                  label="Status"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="inactive">Inactive</Option>
                    <Option value="active">Active</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Actions */}
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
