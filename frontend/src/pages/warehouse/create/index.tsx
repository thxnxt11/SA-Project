import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Form,
  Input,
  InputNumber,
  Card,
  Row,
  Col,
  Divider,
  Upload,
  Select,
  message,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import {
  concertAPI,
  categoriesAPI,
  colorsAPI,
  sizesAPI
} from "../../../services/https";

const { Title } = Typography;
const { Option } = Select;

const CreateWarehouse: React.FC = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  // const [apiLoaded, setApiLoaded] = useState(false);
  // const [loading, setLoading] = useState(false);
  const category = Form.useWatch("category", form);

  const [categories, setCategories] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [concerts, setConcerts] = useState<any[]>([]);
  const onGetInitialData = async () => {
    try {
      const [concertsRes, categoriesRes, colorsRes, sizesRes] = await Promise.all([
        concertAPI.getAll(),
        categoriesAPI.getAllCategories(),
        colorsAPI.getAllColors(),
        sizesAPI.getAllSizes(),
      ]);
      if (concertsRes.status === 200 && categoriesRes.status === 200 && colorsRes.status === 200 && sizesRes.status === 200) {
        setConcerts(concertsRes.data);
        setCategories(categoriesRes.data);
        setColors(colorsRes.data);
        setSizes(sizesRes.data);
        // setApiLoaded(true);
      } else {
        messageApi.open({
          type: "error",
          content: "ไม่สามารถดึงข้อมูลเริ่มต้นได้",
        });
        setTimeout(() => {
          // navigate("/organizer/promotion");
        }, 2000);
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
      console.error("Fetch error:", error);
      setTimeout(() => {
        // navigate("/organizer/promotion");
      }, 2000);
    }
  };    

  useEffect(() => {
    onGetInitialData();
    return () => {};
}, []);

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const onFinish = async (values: any) => {
  try {
    const payloadVariants: any[] = [];

    if (Array.isArray(values.variants)) {
      for (const v of values.variants) {
        let base64Image = "";
        if (v.picture && v.picture.length > 0 && v.picture[0].originFileObj) {
          base64Image = await getBase64(v.picture[0].originFileObj);
        }

        // สร้าง array ของ size + quantity
        Object.entries(v)
          .filter(([key]) => !["color", "picture"].includes(key))
          .forEach(([sizeId, quantity]) => {
            const qty = Number(quantity);
            const sid = Number(sizeId);
            if (qty > 0 && !isNaN(sid)) {
              payloadVariants.push({
                color_id: Number(v.color),
                size_id: sid,
                quantity: qty,
                picture: base64Image
              });
            }
        });
      }
    }

    const payload = {
      product_name: values.product_name,
      category_id: values.category,
      product_detail: values.product_detail,
      product_price: values.product_price,
      quantity: values.quantity || null,
      minimum: values.minimum,
      concert_id: values.concert_id || null,
      variants: payloadVariants,
    };
    
    console.log("Payload Variants:", payloadVariants);
    console.log("Payload:", payload);
    console.log("Variants for API:", payloadVariants);
    payloadVariants.forEach((v, index) => {
      if (!v.color_id || !v.size_id || v.quantity === undefined || !v.picture) {
        console.warn(`Variant #${index} missing required field`, v);
      }
    });
    
    
    const res = await axios.post("http://localhost:8000/products", payload);

    if (res.status === 201) {
      message.success(res.data.message || "เพิ่มสินค้าสำเร็จ!");
      form.resetFields();
    } else {
      message.error(res.data.error || "เพิ่มสินค้าไม่สำเร็จ");
    }
  } catch (error) {
    console.error("Submit error:", error);
    message.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
  }
};


  return (
    <>
      {contextHolder}
      <Title level={3}>Add Product</Title>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        {/* Product Info */}
      <Card>
        <Row>
          <Col style={{ marginLeft: "2%", width: "45%" }}>
            <Form.Item
              label="Product Name"
              name="product_name"
              rules={[{ required: true, message: "กรุณากรอกชื่อสินค้า" }]}
            >
              <Input placeholder="เช่น เสื้อยืด Eventix" />
            </Form.Item>
            <Col>
              <Form.Item
                label="Concert"
                name="concert_id"
                // rules={[{ required: flase, message: "เลือกคอนเสิร์ต" }]}
              >
                <Select placeholder="เลือกคอนเสิร์ต">
                    {concerts.map(c => (
                      <Option key={c.ID} value={c.ID}>{c.concert}</Option>
                    ))}
                  </Select>
              </Form.Item>
            </Col>

            <Row gutter={[40, 40]}>
              <Col span={8}>
                <Form.Item
                  label="Category"
                  name="category"
                  rules={[{ required: true, message: "กรุณาเลือกหมวดหมู่" }]}
                  >
                  <Select placeholder="เลือกประเภทสินค้า">
                    {categories.map(cat => (
                      <Option key={cat.ID} value={cat.ID}>{cat.category}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Price"
                  name="product_price"
                  rules={[{ required: true, message: "กรุณากรอกราคา" }]}
                >
                  <InputNumber min={0} style={{width: "100%" }} placeholder="เช่น 100"/>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Minimum Quantity"
                  name="minimum"
                  rules={[{ required: true, message: "กรุณากรอกจำนวนขั้นต่ำ" }]}
                >
                  <InputNumber min={0} style={{ width: "100%" }} placeholder="เช่น 50"/>
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col style={{ marginLeft: "2.5%", width: "45%"}}>
            <Form.Item
              label="Product Detail"
              name="product_detail"
              rules={[{ required: true, message: "กรุณากรอกรายละเอียดสินค้า" }]}
              >
              <Input.TextArea placeholder="เช่น เนื้อผ้า cotton 100%" style={{ minHeight: "205px" }}/>
            </Form.Item>
          </Col>
        </Row>
        </Card>
                                                                          {/* Variants for specific categories */}
        {[1, 3].includes(category) && (
          <div style={{ padding: 5, margin: "0 auto", width: "60%" }}>
            <Divider style={{ fontSize: 28 }}>Color and Size</Divider>
            <Form.List name="variants">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map(({ key, name, ...restField }, variantIndex) => (
                    <Card
                      key={key}
                      title={`Color ${variantIndex + 1}`}
                      style={{ marginBottom: 16 }}
                      extra={fields.length > 1 && (
                        <Button danger onClick={() => remove(name)}>Delete</Button>
                      )}
                    >
                      {/* Select Color */}
                      <Form.Item
                        {...restField}
                        label="Product Color"
                        name={[name, "color"]}
                        rules={[{ required: true, message: "กรุณาเลือกสีสินค้า" }]}
                      >
                        <Select placeholder="Select color">
                          {colors.map(c => (
                            <Option key={c.ID} value={c.ID}>{c.color}</Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Row gutter={16} style={{ border: "1px solid #ccc", padding: 16, borderRadius: 10 }}>
                        {/* Upload Image */}
                        <Col span={10} style={{ textAlign: "center" }}>
                          <Form.Item
                            {...restField}
                            label="Product Picture"
                            name={[name, "picture"]}
                            valuePropName="fileList"
                            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
                            rules={[{ required: true, message: "กรุณาอัปโหลดรูปสินค้า" }]}
                          >
                            <Upload
                              listType="picture-card"
                              maxCount={1}
                              beforeUpload={() => false}
                              style={ {width: "210px" ,height:"240px" ,margin: "0 auto"}}
                            >
                              <div>
                                <UploadOutlined />
                                <div>Upload</div>
                              </div>
                            </Upload>
                          </Form.Item>
                        </Col>

                        <Col span={1}>
                          <Divider type="vertical" style={{ height: "100%" }} />
                        </Col>


                        {/* Sizes */}
                        <Col span={13}>
                          <Row>
                            <Col span={12} style={{ textAlign: "center", fontWeight: "bold" }}>Size</Col>
                            <Col span={12} style={{ textAlign: "center", fontWeight: "bold" }}>Quantity</Col>
                          </Row>
                          {sizes.map(sizeItem => (
                            <Row key={`${sizeItem.id}`} align="middle" gutter={16} style={{ margin: 8 }}>
                              <Col span={12} style={{ display: "flex", justifyContent: "center" }}>
                                <Button disabled style={{ width: "80%" }}>{sizeItem.size}</Button>
                              </Col>
                              <Col span={12} style={{ display: "flex", justifyContent: "center" }}>
                                <Form.Item
                                  name={[name, `${sizeItem.id}`]}
                                  initialValue={0}
                                  style={{ marginBottom: 0, width: "80%" }}
                                >
                                  <InputNumber min={0} style={{ width: "100%" }} />
                                </Form.Item>
                              </Col>
                            </Row>
                          ))}
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      เพิ่มสีสินค้าใหม่
                    </Button>
                  </Form.Item>
                </div>
              )}
            </Form.List>
          </div>
        )}

        {/* Quantity for other categories */}
        {category && ![1, 3].includes(category) && (
          <div style={{ marginLeft: "2%", width: "45%" }}>
            <Form.Item
              label="Quantity to Add"
              name="quantity"
              rules={[{ required: true, message: "กรุณากรอกจำนวนสินค้า" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </div>
        )}

        {/* Submit */}
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add Product</Button>
          </Form.Item>
        </div>
      </Form>
    </>
  );
};

export default CreateWarehouse;