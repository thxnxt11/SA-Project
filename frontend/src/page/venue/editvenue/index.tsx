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
  Tooltip,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { venueAPI, equipmentAPI } from "../../../services/https";
import type { VenueInterface } from "../../../interfaces/venue";

const { Option } = Select;

const EditVenue: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { venue } = location.state as { venue: VenueInterface };

  const [venueTypes, setVenueTypes] = useState<any[]>([]);
  const [stageTypes, setStageTypes] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // stock map ของอุปกรณ์ทั้งหมด
  const [equipmentStock, setEquipmentStock] = useState<{
    [key: number]: number;
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [venueTypeRes, stageTypeRes, eqRes] = await Promise.all([
          venueAPI.getVenueTypes?.(),
          venueAPI.getStageTypes?.(),
          equipmentAPI.getAllEquipments?.(),
        ]);
        console.log("eq", eqRes);

        setVenueTypes(venueTypeRes?.data || []);
        setStageTypes(stageTypeRes?.data || []);
        setEquipments(eqRes?.data || []);

        // สร้าง stock map {equipmentId: remaining_quantity}
        const stockMap: { [key: number]: number } = {};
        (eqRes?.data || []).forEach((e: any) => {
          stockMap[e.ID] = e.remaining_quantity;
        });
        setEquipmentStock(stockMap);

        // map stage + equipments ให้ form
        const stages =
          venue.stages?.map((s: any) => ({
            stage_id: s.ID,
            stage_name: s.stage_name,
            stage_type_id: s.stage_type_id,
            width: s.width,
            length: s.length,
            equipments: s.equipments?.map((e: any) => ({
              stage_equipment_id: e.ID,
              equipment_id: e.equipment.ID,
              quantity: e.stage_quantity,
            })),
            // stage_equipment: s.stage_quantity?.map((se: any) => ({
            //   equipment_id: se.equipment?.equipment,
            //   quantity: se.StageQuantity, // ใช้ StageQuantity จาก StageEquipment
            // })),
          })) || [];

        form.setFieldsValue({
          venue_name: venue.venue_name,
          location: venue.location,
          venue_capacity: venue.venue_capacity,
          venue_type_id: venue.venue_type_id,
          stages,
        });
        console.log("stages:", stages);
      } catch (error) {
        console.error(error);
        message.error("Cannot load selection data from backend");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [venue, form]);
  console.log(venue, form);

  // ฟังก์ชัน update stock ตามทุก stage
  const updateStock = (allValues: any) => {
    const newStock: { [key: number]: number } = {};
    equipments.forEach((e) => {
      newStock[e.ID] = e.remaining_quantity;
    });

    allValues.stages?.forEach((stage: any) => {
      stage.equipments?.forEach((eq: any) => {
        if (eq.equipment_id && eq.quantity) {
          newStock[eq.equipment_id] -= eq.quantity;
        }
      });
    });

    setEquipmentStock(newStock);
  };
  const handleDeleteEquipment = async (id: number): Promise<void> => {
    try {
      await venueAPI.deleteStageEquipment(id);
      message.success("Equipment deleted successfully!");
    } catch (error) {
      console.error(error);
      message.error("Failed to delete equipment. Please try again.");
    }
  };
  const handleDeleteStage = async (id: number) => {
    try {
      await venueAPI.deleteStage(id);
      message.success("Stage Deleted successfully!");
    } catch (error) {
      console.error(error);
      message.error("Failed to deleted stage. Please try again.");
    }
  };
  const handleValuesChange = (_: any, allValues: any) => {
    updateStock(allValues);
  };

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
        <p>Update venue, stage, and equipment details</p>

        <Card style={{ border: "1px solid #212121ff", borderRadius: 8 }}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            style={{ marginTop: 16 }}
            onValuesChange={handleValuesChange}
          >
            {/* Venue Info */}
            <h2 style={{ fontWeight: "bold", fontSize: 18 }}>
              Venue Information
            </h2>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Venue Name"
                  name="venue_name"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter venue name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Location"
                  name="location"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Enter location" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Capacity (people)"
                  name="venue_capacity"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Venue Type"
                  name="venue_type_id"
                  rules={[{ required: true }]}
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
            <Card
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                marginTop: 24,
              }}
            >
              <h2 style={{ fontWeight: "bold", fontSize: 18 }}>
                Stage Information
              </h2>
              <Form.List name="stages">
                {(fields, { add: addStage, remove: removeStage }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, stageIndex) => (
                      <Card
                        key={key}
                        type="inner"
                        title={`Stage ${stageIndex + 1}`}
                        extra={
                          <Button
                            danger
                            onClick={async () => {
                              const stageId = form.getFieldValue([
                                "stages",
                                name,
                                "stage_id",
                              ]);
                              if (stageId) {
                                await handleDeleteStage(stageId); // ส่ง stageId จริง ๆ ไป
                              }
                              removeStage(name);
                            }}
                          >
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
                              rules={[{ required: true }]}
                            >
                              <Input placeholder="Stage name" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "stage_type_id"]}
                              label="Stage Type"
                              rules={[{ required: true }]}
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
                              rules={[{ required: true }]}
                            >
                              <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "length"]}
                              label="Length (meters)"
                              rules={[{ required: true }]}
                            >
                              <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* Equipment per stage */}
                        <Form.List name={[name, "equipments"]}>
                          {(eqFields, { add: addEq, remove: removeEq }) => (
                            <>
                              {eqFields.map(
                                ({
                                  key: eqKey,
                                  name: eqName,
                                  ...eqRestField
                                }) => {
                                  // disable option ถ้าเลือกซ้ำ stage นี้
                                  const selectedIds = eqFields
                                    .filter((f) => f.name !== eqName)
                                    .map((f) =>
                                      form.getFieldValue([
                                        "stages",
                                        name,
                                        "equipments",
                                        f.name,
                                        "equipment_id",
                                      ])
                                    )
                                    .filter(Boolean);

                                  return (
                                    <Row gutter={16} key={eqKey} align="middle">
                                      <Col span={12}>
                                        <Form.Item
                                          {...eqRestField}
                                          name={[eqName, "equipment_id"]}
                                          label="Equipment"
                                          rules={[{ required: true }]}
                                        >
                                          <Select placeholder="Select equipment">
                                            {equipments.map((e) => (
                                              <Option
                                                key={e.ID}
                                                value={e.ID}
                                                disabled={selectedIds.includes(
                                                  e.ID
                                                )}
                                              >
                                                <Tooltip
                                                  title={`Remaining: ${
                                                    equipmentStock[e.ID]
                                                  }, Type: ${e.equipment_type}`}
                                                >
                                                  {e.equipment_name}
                                                </Tooltip>
                                              </Option>
                                            ))}
                                          </Select>
                                        </Form.Item>
                                      </Col>
                                      <Col span={8}>
                                        <Form.Item
                                          {...eqRestField}
                                          name={[eqName, "quantity"]}
                                          label="Quantity"
                                          rules={[
                                            {
                                              required: true,
                                              message: "Enter quantity",
                                            },
                                            ({ getFieldValue }) => ({
                                              validator(_, value) {
                                                const eqId = getFieldValue([
                                                  "stages",
                                                  name,
                                                  "equipments",
                                                  eqName,
                                                  "equipment_id",
                                                ]);
                                                if (!eqId)
                                                  return Promise.resolve();
                                                if (
                                                  value > equipmentStock[eqId]
                                                ) {
                                                  return Promise.reject(
                                                    new Error(
                                                      `Exceeds remaining stock: ${equipmentStock[eqId]}`
                                                    )
                                                  );
                                                }
                                                return Promise.resolve();
                                              },
                                            }),
                                          ]}
                                        >
                                          <InputNumber
                                            min={1}
                                            style={{ width: "100%" }}
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col span={4}>
                                        <Button
                                          danger
                                          onClick={async () => {
                                            const stageeq_Id =
                                              form.getFieldValue([
                                                "stages",
                                                name,
                                                "equipments",
                                                eqName,
                                                "stage_equipment_id",
                                              ]);
                                            console.log("stage_eq", stageeq_Id);

                                            // ถ้ามี stage_equipment_id แสดงว่าเป็น equipment ที่มีอยู่แล้วในฐานข้อมูล
                                            if (stageeq_Id) {
                                              try {
                                                await handleDeleteEquipment(
                                                  stageeq_Id+
                                                );
                                                // หลังจากลบใน backend สำเร็จแล้วค่อยลบใน form
                                                removeEq(eqName); // แก้จาก removeEq(name) เป็น removeEq(eqName)
                                              } catch (error) {
                                                console.error(
                                                  "Failed to delete equipment:",
                                                  error
                                                );
                                                // ถ้าลบไม่สำเร็จ ไม่ต้องลบใน form
                                                return;
                                              }
                                            } else {
                                              // ถ้าไม่มี stage_equipment_id แสดงว่าเป็น equipment ใหม่ที่ยังไม่ได้บันทึก
                                              // ลบใน form ได้เลย
                                              removeEq(eqName);
                                            }

                                            // อัพเดท stock หลังจากลบ equipment
                                            const allValues =
                                              form.getFieldsValue();
                                            updateStock(allValues);
                                          }}
                                        >
                                          Remove
                                        </Button>
                                      </Col>
                                    </Row>
                                  );
                                }
                              )}
                              <Form.Item>
                                <Button
                                  type="dashed"
                                  onClick={() => addEq()}
                                  block
                                >
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
                Save Changes
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => navigate("/venue")}
              >
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
