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
import { useNavigate, useLocation } from "react-router-dom";
import { venueAPI } from "../../../services/https";
import type { VenueInterface } from "../../../interfaces/venue";


const { Option } = Select;

const EditVenue: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { venue } = location.state as { venue: VenueInterface };

  const [venueTypes, setVenueTypes] = useState<any[]>([]);
  const [stageTypes, setStageTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลด option จาก backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venueRes, stageRes] = await Promise.all([
          venueAPI.getVenueTypes?.(),
          venueAPI.getStageTypes?.()
         
        ]);
        setVenueTypes(venueRes?.data || []);
        setStageTypes(stageRes?.data || []);
        // กำหนดค่า default form
        form.setFieldsValue({
          venue_name: venue.venue_name,
          location: venue.location,
          venue_capacity: venue.venue_capacity,
          venue_type_id: venue.venue_type_id,
          stages: venue.stages?.map((s) => ({
            stage_name: s.stage_name,
            stage_type_id: s.stage_type_id,
            width: s.width,
            length: s.length,
          })) || [],
        });
      } catch (error) {
        console.error("Failed to load types:", error);
        message.error("Cannot load selection data from backend");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [venue, form]);

  const onFinish = async (values: VenueInterface) => {
    try {
      console.log("Update payload:", values);
      await venueAPI.update(venue.ID!, values);
      message.success("Venue updated successfully!");
      navigate("/venue");
    } catch (error) {
      console.error(error);
      message.error("Failed to update venue. Please try again.");
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
        <h1 style={{ fontWeight: "bold", fontSize: 28 }}>Edit Venue</h1>
        <p>Update venue and stage details</p>

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
                        style={{
                          border: "1px dashed #aaa",
                          borderRadius: 6,
                          padding: 16,
                          marginBottom: 12,
                          backgroundColor: "#fafafa",
                        }}
                        type="inner"
                        title={`Stage ${index + 1}`}
                        extra={
                          <Button danger size="small" onClick={() => remove(name)}>
                            Remove Stage
                          </Button>
                        }
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
                                  <Option key={st.ID} value={st.ID}>
                                    {st.stage_type}
                                  </Option>
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
                      <Button type="dashed" onClick={() => add()} block>
                        + Add Stage
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>

            {/* Action Buttons */}
            <Form.Item style={{ marginTop: 24, textAlign: "right" }}>
              <Button type="primary" htmlType="submit">
                Save Changes
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

export default EditVenue;
