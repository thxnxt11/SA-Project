import type React from "react";
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
} from "antd";
import type { InputNumberProps, DatePickerProps } from "antd";
import type { PromotionInterface } from "../../../interface/promotion";
import dayjs from "dayjs";

const { Option } = Select;

interface EditPromotionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  promotionId: number | null;
}

const concertList = [
  { id: 1, name: "AESPA" },
  { id: 2, name: "NCT DREAM" },
  { id: 3, name: "ITZY" },
];

const EditPromotionModal: React.FC<EditPromotionModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  promotionId,
}) => {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [promotion, setPromotion] = useState<PromotionInterface | null>(null);

  // Mock data - same as in the main component
  const mockData: PromotionInterface[] = [
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

  // Map promotion type number to string
  const getPromotionTypeString = (type: number | undefined) => {
    if (!type) return "Early Bird"; // default value if undefined

    switch (type) {
      case 1:
        return "Early Bird";
      case 2:
        return "Code";
      case 3:
        return "Concert";
      default:
        return "Early Bird";
    }
  };

  useEffect(() => {
    if (visible && promotionId) {
      // Mock API call to fetch promotion data
      const foundPromotion = mockData.find((p) => p.ID === promotionId);

      if (foundPromotion) {
        setPromotion(foundPromotion);
        const promotionTypeString = getPromotionTypeString(
          foundPromotion.promotion_type
        );
        setSelectedType(promotionTypeString);

        // Set form values
        form.setFieldsValue({
          promotion_name: foundPromotion.promotion_name,
          promotion_type: promotionTypeString,
          discount: foundPromotion.discount,
          start_date: dayjs(foundPromotion.start_date, "DD/MM/YYYY"),
          endt_date: dayjs(foundPromotion.end_date, "DD/MM/YYYY"),
          usage_limit: foundPromotion.limit,
          promotion_status: foundPromotion.promotion_status,
          description: "Sample description", // Mock description
          promotion_code:
            promotionTypeString === "Code" ? "SAMPLE_CODE" : undefined,
          Concert: promotionTypeString === "Concert" ? "AESPA" : undefined,
        });
      }
    }
  }, [visible, promotionId, form]);

  const handlePromotionTypeChange = (value: string) => {
    setSelectedType(value);
    form.setFieldsValue({ Concert: undefined, promotion_code: undefined });
  };

  const onStatusChange = (value: string) => {
    switch (value) {
      case "Inactive":
        break;
      case "Active":
        break;
      default:
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Mock API call to update promotion
      console.log("Updating promotion:", {
        id: promotionId,
        ...values,
        start_date: values.start_date.format("DD/MM/YYYY"),
        endt_date: values.endt_date.format("DD/MM/YYYY"),
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Promotion updated successfully!");
      onSuccess();
      handleCancel();
    } catch (error) {
      message.error("Failed to update promotion");
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedType(null);
    onCancel();
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log("Change:", e.target.value);
  };

  const onDiscountChange: InputNumberProps["onChange"] = (value) => {
    console.log("changed", value);
  };

  const onDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
  };

  return (
    <Modal
      style={{ position: "absolute", top: 45, left: 300 }}
      title=<h2 style={{ display: "flex", justifyContent: "center" }}>
        Edit Promotion
      </h2>
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Divider style={{ borderColor: "#d3d3d3ff" }} />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 900 }}
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
                >
                  <Option value="Early Bird">Early Bird</Option>
                  <Option value="Code">Code</Option>
                  <Option value="Concert">Concert</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[50, 0]}>
            {selectedType === "Code" && (
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Form.Item
                  name="promotion_code"
                  label="Discount Code"
                  rules={
                    selectedType === "Code"
                      ? [
                          {
                            required: true,
                            message: "Please enter a code",
                          },
                        ]
                      : []
                  }
                >
                  <Input placeholder="Enter your code" style={{ width: 650 }} />
                </Form.Item>
              </Col>
            )}
            {selectedType === "Concert" && (
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Form.Item
                  name="Concert"
                  label="Concert"
                  rules={
                    selectedType === "Concert"
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
                    style={{ width: 650 }}
                    allowClear
                  >
                    {concertList.map((concert) => (
                      <Option key={concert.id} value={concert.name}>
                        {concert.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row gutter={[50, 0]}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true }]}
              >
                <Input.TextArea
                  showCount
                  maxLength={255}
                  onChange={onChange}
                  placeholder="description"
                  style={{ width: 650 }}
                />
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
                  style={{ width: 300 }}
                  onChange={onDiscountChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                name="usage_limit"
                label="Usage Limit"
                rules={[{ required: true }]}
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
                rules={[{ required: true }]}
              >
                <DatePicker
                  format={{
                    format: "YYYY-MM-DD HH:mm:ss",
                    type: "mask",
                  }}
                  style={{ width: 300 }}
                  onChange={onDateChange}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              <Form.Item
                name="endt_date"
                label="End Date"
                rules={[{ required: true }]}
              >
                <DatePicker
                  format={{
                    format: "YYYY-MM-DD HH:mm:ss",
                    type: "mask",
                  }}
                  style={{ width: 300 }}
                  onChange={onDateChange}
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
                <Select
                  onChange={onStatusChange}
                  allowClear
                  style={{ width: 300 }}
                >
                  <Option value="inactive">Inactive</Option>
                  <Option value="active">Active</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row
            style={{ display: "flex", justifyContent: "center", marginTop: 30 }}
          >
            <Form.Item>
              <Space>
                <Button htmlType="button" onClick={onReset}>
                  Reset
                </Button>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update
                </Button>
              </Space>
            </Form.Item>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default EditPromotionModal;
