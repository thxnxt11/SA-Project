import React, { useState } from "react";
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
} from "antd";
import type { InputNumberProps, DatePickerProps } from "antd";

const { Option } = Select;

const concertList = [
  { id: 1, name: "AESPA" },
  { id: 2, name: "NCT DREAM" },
  { id: 3, name: "ITZY" },
];
const AddPromotion: React.FC = () => {
  const [form] = Form.useForm();

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handlePromotionTypeChange = (value: string) => {
    setSelectedType(value);
    form.setFieldsValue({ concert: undefined, code: undefined }); // reset fields
  };
  const onStatusChange = (value: string) => {
    switch (value) {
      case "Inactive":
        // form.setFieldsValue({ note: "Hi, man!" });
        break;
      case "Active":
        // form.setFieldsValue({ note: "Hi, lady!" });
        break;
      default:
    }
  };

  const onFinish = (values: any) => {
    console.log(values);
  };

  const onReset = () => {
    form.resetFields();
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
    <>
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
                      >
                        <Option value="Ealry Bird">Ealry Bird</Option>
                        <Option value="Code">Code</Option>
                        <Option value="Concert">Concert</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[50, 0]}>
                  {selectedType === "Code" && (
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
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
                        <Input
                          placeholder="Enter your code"
                          style={{ width: 625 }}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  {selectedType === "Concert" && (
                    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
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
                          style={{ width: 625 }}
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
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
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
                        style={{ width: 625 }}
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
                        defaultValue={0}
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
                      name="end_date"
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
                        <Option value="Inactive">Inactive</Option>
                        <Option value="Active">Active</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: "flex", justifyContent: "center" }}>
                  <Form.Item>
                    <Space>
                      <Button htmlType="button" onClick={onReset}>
                        Reset
                      </Button>
                      <Button type="primary" htmlType="submit">
                        Submit
                      </Button>
                    </Space>
                  </Form.Item>
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
