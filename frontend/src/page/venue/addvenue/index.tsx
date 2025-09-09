/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import AdminsidebarLayout from "../../../components/sidebarLayout";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  message,
  Spin,
} from "antd";
import { useNavigate } from "react-router-dom";
import { venueAPI } from "../../../services/https";
import type { VenueInterface } from "../../../interfaces/venue";


const { Option } = Select;

const AddVenue: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // State สำหรับ option จาก backend
  const [venueTypes, setVenueTypes] = useState<any[]>([]);
  const [stageTypes, setStageTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูล venueType และ stageType จาก backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venueRes, stageRes] = await Promise.all([
          venueAPI.getVenueTypes?.(),
         venueAPI.getStageTypes?.(),
        ]);
        setVenueTypes(venueRes?.data || []);
        setStageTypes(stageRes?.data || []);
      } catch (error) {
        console.error("Failed to load types:", error);
        message.error("Cannot load selection data from backend");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Submit form
  const onFinish = async (values: VenueInterface) => {
  try {
    console.log("Submit payload:", values);
    await venueAPI.create(values); // ส่ง Venue + Stage[] ไป backend
    message.success("Venue with stages created successfully!");
    navigate("/venue");
  } catch (error) {
    console.error(error);
    message.error("Failed to create venue. Please try again.");
  }
};


  if (loading) {
    return (
      <AdminsidebarLayout>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      </AdminsidebarLayout>
    );
  }

  return (
    <AdminsidebarLayout>
      <div style={{ padding: "20px" }}>
        <h1 style={{ fontWeight: "bold", fontSize: 28 }}>Add New Venue</h1>
        <p>Fill in the venue and stage details</p>

        <Card style={{ border: "1px solid #212121ff", borderRadius: 8 }}>
          <Form layout="vertical" form={form} onFinish={onFinish} style={{ marginTop: 16 }}>
            {/* Venue Info */}
            <h2 style={{ fontWeight: "bold", fontSize: 18 }}>Venue Information</h2>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Venue Name"
                  name="venue_name"
                  rules={[{ required: true, message: "Please enter venue name!" }]}
                >
                  <Input placeholder="Enter venue name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Location"
                  name="location"
                  rules={[{ required: true, message: "Please enter location!" }]}
                >
                  <Input placeholder="Enter location" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Capacity (people)"
                  name="venue_capacity"
                  rules={[{ required: true, message: "Please enter capacity!" }]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter capacity" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Venue Type"
                  name="venue_type_id"
                  rules={[{ required: true, message: "Please select venue type!" }]}
                >
                  <Select showSearch allowClear placeholder="Select venue type">
                    {venueTypes.map((vt) => (
                      <Option key={vt.ID} value={vt.ID}>
                        {vt.venue_type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Stage Info */}
            <Card style={{ border: "1px solid #ccc", borderRadius: 8, marginTop: 24 }}>
              <h2 style={{ fontWeight: "bold", fontSize: 18 }}>Stage Information</h2>
              <Form.List name="stages">
  {(fields, { add, remove }) => (
    <>
      {fields.map(({ key, name, ...restField }, index) => (
        <Card
          key={key}
          type="inner"
          title={`Stage ${index + 1}`}
          extra={<Button danger size="small" onClick={() => remove(name)}>Remove Stage</Button>}
          style={{ marginBottom: 12 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[name, "stage_name"]}
                label="Stage Name"
                rules={[{ required: true, message: "Please enter stage name" }]}
              >
                <Input placeholder="Stage name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[name, "stage_type_id"]}
                label="Stage Type"
                rules={[{ required: true, message: "Please select stage type" }]}
              >
                <Select placeholder="Select stage type">
                  {stageTypes.map((st) => (
                    <Option key={st.ID} value={st.ID}>{st.stage_type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[name, "width"]}
                label="Width (meters)"
                rules={[{ required: true, message: "Please enter width" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...restField}
                name={[name, "length"]}
                label="Length (meters)"
                rules={[{ required: true, message: "Please enter length" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ))}
      <Form.Item>
        <Button type="dashed" onClick={() => add()} block>+ Add Stage</Button>
      </Form.Item>
    </>
  )}
</Form.List>

            </Card>

            {/* Action Buttons */}
            <Form.Item style={{ marginTop: 24, textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={() => navigate("/venue")}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminsidebarLayout>
  );
};

export default AddVenue;
