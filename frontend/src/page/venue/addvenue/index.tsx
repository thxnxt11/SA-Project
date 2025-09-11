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
import { venueAPI, equipmentAPI } from "../../../services/https";
import type { VenueInterface } from "../../../interfaces/venue";

const { Option } = Select;

const AddVenue: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [venueTypes, setVenueTypes] = useState<any[]>([]);
  const [stageTypes, setStageTypes] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [venueRes, stageRes, eqRes] = await Promise.all([
          venueAPI.getVenueTypes?.(),
          venueAPI.getStageTypes?.(),
          equipmentAPI.getAllEquipments?.(),
        ]);
        setVenueTypes(venueRes?.data || []);
        setStageTypes(stageRes?.data || []);
        setEquipments(eqRes?.data || []);
      } catch (error) {
        console.error(error);
        message.error("Cannot load selection data from backend");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onFinish = async (values: VenueInterface) => {
    try {
      console.log("Submit payload:", values);
      await venueAPI.create(values);
      message.success("Venue with stages and equipments created successfully!");
      navigate("/venue");
    } catch (error) {
      console.error(error);
      message.error("Failed to create venue. Please try again.");
    }
  };

  if (loading) {
    return (
      <AdminsidebarLayout>
        <div style={{ padding: 20, textAlign: "center" }}>
          <Spin size="large" />
        </div>
      </AdminsidebarLayout>
    );
  }

  return (
    <AdminsidebarLayout>
      <div style={{ padding: 20 }}>
        <h1 style={{ fontWeight: "bold", fontSize: 28 }}>Add New Venue</h1>

        <Card style={{ border: "1px solid #212121ff", borderRadius: 8 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ marginTop: 16 }}
          >
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
                {(fields, { add: addStage, remove: removeStage }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card
                        key={key}
                        type="inner"
                        title={`Stage ${index + 1}`}
                        extra={
                          <Button danger size="small" onClick={() => removeStage(name)}>
                            Remove Stage
                          </Button>
                        }
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

                        {/* Equipment for this stage */}
                        <Form.List name={[name, "equipments"]}>
                          {(eqFields, { add: addEq, remove: removeEq }) => (
                            <>
                              {eqFields.map(({ key: eqKey, name: eqName, ...eqRestField }) => {
                                const selectedIds = eqFields
                                  .filter((f) => f.name !== eqName)
                                  .map((f) =>
                                    form.getFieldValue(["stages", name, "equipments", f.name, "equipment_id"])
                                  )
                                  .filter(Boolean);

                                return (
                                  <Row gutter={16} key={eqKey} align="middle">
                                    <Col span={12}>
                                      <Form.Item
                                        {...eqRestField}
                                        name={[eqName, "equipment_id"]}
                                        label="Equipment"
                                        rules={[{ required: true, message: "Please select equipment" }]}
                                      >
                                        <Select placeholder="Select equipment">
                                          {equipments.map((e) => (
                                            <Option
                                              key={e.ID}
                                              value={e.ID}
                                              disabled={selectedIds.includes(e.ID)}
                                            >
                                              {e.equipment_name} (Remaining: {e.remaining_quantity})
                                            </Option>
                                          ))}
                                        </Select>
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        {...eqRestField}
                                        name={[eqName, "stage_quantity"]}
                                        label="Quantity"
                                        initialValue={1}
                                        rules={[
                                          { required: true, message: "Enter quantity" },
                                          ({ getFieldValue }) => ({
                                            validator(_, value) {
                                              const eqId = getFieldValue([
                                                "stages",
                                                name,
                                                "equipments",
                                                eqName,
                                                "equipment_id",
                                              ]);
                                              const eqObj = equipments.find((eq) => eq.ID === eqId);
                                              if (!eqObj) return Promise.resolve();
                                              if (value > eqObj.remaining_quantity)
                                                return Promise.reject(
                                                  new Error(`Exceeds remaining stock: ${eqObj.remaining_quantity}`)
                                                );
                                              return Promise.resolve();
                                            },
                                          }),
                                        ]}
                                      >
                                        <InputNumber min={1} style={{ width: "100%" }} />
                                      </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                      <Button danger onClick={() => removeEq(eqName)}>Remove</Button>
                                    </Col>
                                  </Row>
                                );
                              })}
                              <Form.Item>
                                <Button type="dashed" onClick={() => addEq({ quantity: 1 })} block>
                                  + Add Equipment
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => addStage()} block>
                        + Add Stage
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>

            {/* Submit */}
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
