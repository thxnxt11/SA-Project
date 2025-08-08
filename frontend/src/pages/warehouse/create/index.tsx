import React, { useState } from "react";
import { Button, Typography, Form, Input, InputNumber, Card, Row, Col, Divider, Upload } from "antd";
import { UploadOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
const { Title } = Typography;

const CreateWarehouse: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("ข้อมูลที่กรอก:", values);
    // TODO: ส่งข้อมูลไปยัง backend ด้วย API
  };
  const sizes = ["s", "m", "l", "xl", "xxl"];

  const [quantities, setQuantities] = useState<Record<string, number>>({
    s: 0,
    m: 0,
    l: 0,
    xl: 0,
    xxl:0,
  });

  const handleChange = (size: string, value: number) => {
    setQuantities({ ...quantities, [size]: value });
  }
  return (
    <Card style={{  margin: "1000 auto" }}>
      <Title style={{ padding : 15 ,  marginTop: 0, marginBottom : 0, fontSize: 32}}>Add product</Title>
      <Card>

      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        >
        <Row>
          <Col style={{ marginLeft: "2%", width: "45%"}}>
          <Row>
            <Form.Item
              label="Product Name"
              name="name"
              rules={[{ required: true, message: "กรุณากรอกชื่อสินค้า" }]}
              style={{ width: "100%" }}
              >
              <Input placeholder="เช่น เสื้อยืด Eventix" />
            </Form.Item>
          </Row>

          <Row gutter={[40, 40]}>
            <Col span={8}>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "กรุณากรอกหมวดหมู่" }]}
              >
              <Input placeholder="เช่น ของที่ระลึก" />
            </Form.Item>
            </Col>
            <Col span={8}>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "กรุณากรอกราคา" }]}
              style={{ marginLeft: "5%"}}
              >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="เช่น 100" />
            </Form.Item>
            </Col>
            <Col span={8}>
            <Form.Item
              label="Minimum Quantity"
              name="minimum"
              rules={[{ required: true, message: "กรุณากรอกจำนวนขั้นต่ำ" }]}
              style={{ marginLeft: "5%",}}
              >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="เช่น 50" />
            </Form.Item>
            </Col>
          </Row>
          </Col>

          <Col style={{ marginLeft: "2.5%",width: "45%", maxHeight: "120vh"}}>
            <Form.Item
              label="Product Detail"
              name="detail"
              rules={[{ required: true, message: "กรุณากรอกรายละเอียดสินค้า" }]}
              >
              <Input.TextArea
                placeholder="เช่น เนื้อผ้า cotton 100%"
                style={{
                  height: "120px", 
                  resize: "none",     // ไม่ให้ลากขนาด
                }}
                />
            </Form.Item>
          </Col>
        </Row>

      </Form>
      </Card>


      {/* {colorandsize} */}
      <div style={{  padding: 5, margin: "0 auto",width:"40%" }} >
      <Title style={{ padding: 15, fontSize: 32 }}>Color and Size</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    title={`Color ${name + 1}`}
                    style={{ marginBottom: 16 }}
                    extra={
                      fields.length > 1 && (
                        <Button danger onClick={() => remove(name)}>
                          Delete
                        </Button>
                      )
                    }
                  >
                    <Form.Item label="Product Color" name="color"
                      style={{  marginLeft: 5 ,width:"20%" }}>
                      <Input placeholder="enter color" />
                    </Form.Item>
                    <Row gutter={16} style={{ border: "1px solid #ccc", padding: 16, borderRadius: 10 }}>
                      {/* ฝั่งรูปภาพ */}
                      <Col span={10} style={{ textAlign: "center" , maxHeight: "100vh" }}>
                        <Form.Item label="Product Pictrue" name="image" >
                          <Upload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={() => false} // เพื่อไม่ให้อัปโหลดทันที
                            style={{  margin: "0 auto", width:"100%" , height:"200px" }}
                          >
                            <div>
                              <UploadOutlined />
                              <div>Upload Product Pictrue</div>
                            </div>
                          </Upload>
                        </Form.Item>
                      </Col>

                      <Col span={1}>
                        <Divider type="vertical" style={{ height: "100%" }} />
                      </Col>

                      {/* ฝั่งขนาดและจำนวน */}
                      <Col span={13} >
                        <Row>
                          <Col span={12} style={{ fontWeight: "bold", textAlign: "center"}}>Size</Col>
                          <Col span={12} style={{ fontWeight: "bold", textAlign: "center"}}>Quantity</Col>
                        </Row>

                        {sizes.map((size) => (
                          <Row key={size} align="middle" gutter ={[20, 20]} style={{ marginBottom: 8 , }}>

                            <Col span={12} style={{  textAlign: "center", width:"10%"}}>
                              <Button disabled block>{size}</Button>
                            </Col>

                            <Col span={12} style={{ textAlign: "center" ,}}>

                              <InputNumber
                                min={0}
                                value={quantities[size]}
                                onChange={(value) => handleChange(size, value || 0)}
                                // addonBefore={
                                //   <Button
                                //     type="text"
                                //     icon={<MinusOutlined />}
                                //     onClick={() => handleChange(size, Math.max(0, quantities[size] - 1))}
                                //   />
                                // }
                                // addonAfter={
                                //   <Button
                                //     type="text"
                                //     icon={<PlusOutlined />}
                                //     onClick={() => handleChange(size, quantities[size] + 1)}
                                //   />
                                // }
                              />
                            </Col>
                          </Row>
                        ))}
                      </Col>
                    </Row>
                  </Card>
                ))}

                {/* ปุ่มเพิ่มสี */}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    เพิ่มสีสินค้าใหม่
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* ปุ่ม Submit */}
          
        </Form>

      </div>
      <div style={{ textAlign: "center", marginTop: 30}}>
        <Form.Item>
          <Button type="primary" htmlType="submit">
              Add Product
            </Button>
        </Form.Item>
      </div>
    </Card>
    
    
  );
};

export default CreateWarehouse;
