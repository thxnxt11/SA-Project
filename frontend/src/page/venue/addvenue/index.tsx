import React from "react";
import AdminsidebarLayout from "../../../components/sidebarLayout";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select } from "antd";

import { useNavigate } from "react-router-dom";
interface StageEquipment {
  device_name: string;
  device_type: string;
  quantity: number;
}

interface Stage {
  stage_name: string;
  stage_type: string;
  width: number;
  length: number;
  equipments?: StageEquipment[];
}

interface VenueForm {
  venue_name: string;
  location: string;
  capacity: number;
  venue_type: string;
  stages?: Stage[];
}

const { Option } = Select;

const Addvenue: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleChange = (_value: unknown) => {
    console.log("ประเภทสถานที่:", _value);
  };

  const onFinish = (values: VenueForm) => {
    console.log("ส่งข้อมูลทั้งหมด:", values);
    // 👉 สามารถส่งข้อมูลไปยัง backend ที่นี่
    // axios.post('/api/venue', values).then(...)
  };

  return (
    <AdminsidebarLayout>
      <div style={{ padding: "20px" }}>
        <h1 style={{ fontWeight: "bold", fontSize: 28 }}>
          เพิ่มข้อมูลสถานที่ใหม่
        </h1>
        <p>กรอกข้อมูลรายละเอียดสถานที่และเวที</p>

        <Card style={{ border: "1px solid #212121ff", borderRadius: 8 }}>
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            style={{ marginTop: 16 }}
          >
            {/* SECTION: ข้อมูลสถานที่ */}
            <h2 style={{ fontWeight: "bold", fontSize: 18 }}>ข้อมูลสถานที่</h2>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="ชื่อสถานที่"
                  name="venue_name"
                  rules={[
                    { required: true, message: "กรุณากรอกชื่อสถานที่ !" },
                  ]}
                >
                  <Input placeholder="กรอกชื่อสถานที่" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="ที่ตั้ง"
                  name="location"
                  rules={[{ required: true, message: "กรุณากรอกที่ตั้ง !" }]}
                >
                  <Input placeholder="กรอกที่ตั้ง" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="ความจุสูงสุด (คน)"
                  name="capacity"
                  rules={[
                    { required: true, message: "กรุณากรอกจำนวน !" },
                    { type: "number", min: 1, message: "ต้องมากกว่า 0" },
                  ]}
                >
                  <InputNumber
                    min={1}
                    style={{ width: "100%" }}
                    placeholder="กรอกความจุ"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="ประเภทสถานที่"
                  name="venue_type"
                  rules={[
                    { required: true, message: "กรุณาเลือกประเภทสถานที่ !" },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="เลือกหรือพิมพ์ประเภทสถานที่"
                    onChange={handleChange}
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    <Option value="คอนเสิร์ต">คอนเสิร์ต</Option>
                    <Option value="ฮอลล์">ฮอลล์</Option>
                    <Option value="สนามกีฬา">สนามกีฬา</Option>
                    <Option value="ลานกิจกรรม">ลานกิจกรรม</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* SECTION: ข้อมูลเวที */}
            <Card
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                marginTop: 24,
              }}
            >
              <h2 style={{ fontWeight: "bold", fontSize: 18 }}>ข้อมูลเวที</h2>
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
                        title={`เวทีที่ ${index + 1}`}
                        extra={
                          <Button
                            danger
                            size="small"
                            onClick={() => remove(name)}
                          >
                            ลบเวที
                          </Button>
                        }
                      >
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "stage_name"]}
                              label="ชื่อเวที"
                              rules={[
                                {
                                  required: true,
                                  message: "กรุณากรอกชื่อเวที",
                                },
                              ]}
                            >
                              <Input placeholder="ชื่อเวที" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "stage_type"]}
                              label="ประเภทเวที"
                              rules={[
                                {
                                  required: true,
                                  message: "กรุณากรอกประเภทเวที",
                                },
                              ]}
                            >
                              <Input placeholder="---" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "width"]}
                              label="ความกว้าง (เมตร)"
                              rules={[
                                {
                                  required: true,
                                  message: "กรุณากรอกความ ว้าง",
                                },
                              ]}
                            >
                              <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "length"]}
                              label="ความยาว (เมตร)"
                              rules={[
                                { required: true, message: "กรุณากรอกความยาว" },
                              ]}
                            >
                              <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* ✅ SUBLIST: อุปกรณ์เวที */}
                        <h3 style={{}}>อุปกรณ์เวที</h3>
                        <Form.List name={[name, "equipments"]}>
                          {(
                            equipFields,
                            { add: addEquip, remove: removeEquip }
                          ) => (
                            <>
                              {equipFields.map(
                                ({
                                  key: equipKey,
                                  name: equipName,
                                  ...equipRestField
                                }) => (
                                  <Row
                                    gutter={16}
                                    key={equipKey}
                                    style={{ marginBottom: 12, paddingLeft: 8 }}
                                  >
                                    <Col span={8}>
                                      <Form.Item
                                        {...equipRestField}
                                        name={[equipName, "device_name"]}
                                        label="ชื่ออุปกรณ์"
                                        rules={[
                                          {
                                            required: true,
                                            message: "กรอกชื่ออุปกรณ์",
                                          },
                                        ]}
                                      >
                                        <Input placeholder="ชื่ออุปกรณ์" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        {...equipRestField}
                                        name={[equipName, "device_type"]}
                                        label="ประเภท"
                                        rules={[
                                          {
                                            required: true,
                                            message: "กรอกประเภทอุปกรณ์",
                                          },
                                        ]}
                                      >
                                        <Input placeholder="เช่น ไฟ, ลำโพง" />
                                      </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                      <Form.Item
                                        {...equipRestField}
                                        name={[equipName, "quantity"]}
                                        label="จำนวน"
                                        rules={[
                                          {
                                            required: true,
                                            message: "ระบุจำนวน",
                                          },
                                        ]}
                                      >
                                        <InputNumber
                                          min={1}
                                          style={{ width: "100%" }}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col
                                      span={2}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Button
                                        danger
                                        onClick={() => removeEquip(equipName)}
                                      >
                                        ลบ
                                      </Button>
                                    </Col>
                                  </Row>
                                )
                              )}
                              <Form.Item>
                                <Button
                                  type="dashed"
                                  onClick={() => addEquip()}
                                  block
                                  icon="+"
                                >
                                  เพิ่มอุปกรณ์
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Card>
                    ))}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon="+"
                      >
                        เพิ่มเวที
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>

            {/* ปุ่มบันทึก/ยกเลิก */}
            <Form.Item style={{ marginTop: 24 , textAlign: "right"}}>
              <Button type="primary" htmlType="submit">
                บันทึก
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => navigate("/venue")}
              >
                ยกเลิก
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminsidebarLayout>
  );
};

export default Addvenue;
