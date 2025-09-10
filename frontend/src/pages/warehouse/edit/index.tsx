import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Typography,
  Popconfirm,
  Card,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  Select,
  Upload,
  message,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  productsAPI,
  concertAPI,
  categoriesAPI,
  colorsAPI,
  sizesAPI,
  variantAPI,
  uploadAPI,
} from "../../../services/https";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../hook/authContext";
import SidebarLayout from "../../../component/layout/SidebarLayout";


const { Title } = Typography;
const { Option } = Select;

const EditWarehouse: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [form] = Form.useForm();
  const category = Form.useWatch("category_id", form);

  const [products, setProducts] = useState<any[]>([]);
  const [concerts, setConcerts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const { user } = useAuth(); 

  const onGetInitialData = async () => {
    try {
      const [productsRes, concertsRes, categoriesRes, colorsRes, sizesRes] = await Promise.all([
        productsAPI.getAllProducts(),
        concertAPI.getAll(),
        categoriesAPI.getAllCategories(),
        colorsAPI.getAllColors(),
        sizesAPI.getAllSizes(),
      ]);
      if (
        productsRes.status == 200 &&
        concertsRes.status === 200 &&
        categoriesRes.status === 200 &&
        colorsRes.status === 200 &&
        sizesRes.status === 200
      ) {
        setProducts(productsRes.data)
        setConcerts(concertsRes.data);
        setCategories(categoriesRes.data);
        setColors(colorsRes.data);
        setSizes(sizesRes.data);
      } else {
        messageApi.open({
          type: "error",
          content: "ไม่สามารถดึงข้อมูลเริ่มต้นได้",
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    onGetInitialData();
  }, []);

  const handleUploadProductImage = async (file: File): Promise<string> => {
    try {
      const res = await uploadAPI.uploadProductImage(file); // หรือ uploadAPI.uploadProductImage
      return res.data.data.url; // return URL ที่ได้จาก backend
    } catch (err) {
      console.error("Upload error:", err);
      message.error("อัปโหลดรูปสินค้าไม่สำเร็จ");
      return "";
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productsAPI.deleteByID(id);
      messageApi.success("ลบสินค้าสำเร็จ");
      onGetInitialData();
    } catch {
      messageApi.error("ลบสินค้าไม่สำเร็จ");
    }
  };

  const handleEdit = (record: any) => {
  setEditingProduct(record);

  if ([1, 3].includes(record.category_id)) {
    const groupedVariants = record.variants?.reduce((acc: any[], v: any) => {
      const existing = acc.find(item => item.color === v.color?.ID);
      if (existing) {
        existing.sizes[v.size_id] = v.quantity;
        existing.IDs.push(v.ID);
      } else {
        acc.push({
          color: v.color?.ID,
          sizes: { [v.size_id]: v.quantity },
          picture: v.picture
            ? [
                {
                  uid: v.ID.toString(),
                  name: v.picture.split("/").pop(),
                  status: "done",
                  url: `http://localhost:8000${v.picture}`,
                },
              ]
            : [],
          IDs: [v.ID],
        });
      }
      return acc;
    }, []);

    form.setFieldsValue({
      ...record,
      category_id: record.category_id,
      variants: groupedVariants,
    });
  } else {

    const firstVariant = record.variants?.[0] || {};

    form.setFieldsValue({
    ...record,
    category_id: record.category_id,
    quantity: firstVariant.quantity || 0,
    picture: firstVariant.picture
      ? [
          {
            uid: firstVariant.ID?.toString() || "-1",
            name: firstVariant.picture.split("/").pop(), 
            status: "done",
            url:  `http://localhost:8000${firstVariant.picture}`,
          },
        ]
      : [],
  });

  }
  console.log("Edit: ",record);

  setOpen(true);
};

  const handleDeleteVariant = async (variantId: number) => {
    try {
      await variantAPI.deleteByID(variantId);
      messageApi.success("ลบรุ่นสินค้าสำเร็จ");
      onGetInitialData();
    } catch (error) {
      messageApi.error("ไม่สามารถลบรุ่นสินค้าได้");
    }
  };

  const handleUpdate = async () => {
  try {
    const values = await form.validateFields();

    const getBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    };

    const payloadVariants: any[] = [];

    if ([1, 3].includes(values.category_id)) {
      if (Array.isArray(values.variants)) {
        for (const v of values.variants) {
          let pictureUrl = v.picture?.[0]?.originFileObj
            ? await handleUploadProductImage(v.picture[0].originFileObj)
            : v.picture?.[0]?.url || null;

          for (const [sizeId, quantity] of Object.entries(v.sizes || {})) {
            const qty = Number(quantity);
            const sid = Number(sizeId);

            const sizeIndex = Object.keys(v.sizes).indexOf(sizeId);
            const existingId = v.IDs?.[sizeIndex];

            if (qty > 0 && !isNaN(sid)) {
              payloadVariants.push({
                ID: existingId || undefined,
                color_id: Number(v.color),
                size_id: sid,
                quantity: qty,
                picture: pictureUrl,
              });
            } else if (qty === 0 && existingId) {
              await variantAPI.deleteByID(existingId);
            }
          }
        }
      }
    } else {
      // ✅ กรณี category อื่น (ไม่มีสี/ขนาด)
      let pictureUrl = values.picture?.[0]?.originFileObj
        ? await handleUploadProductImage(values.picture[0].originFileObj)
        : editingProduct?.variants?.[0]?.picture || null;

      // หา variant ตัวแรก (ถ้ามี)
      const firstVariant = editingProduct?.variants?.[0] || {};

      payloadVariants.push({
        ID: firstVariant.ID || undefined,
        color_id: null,
        size_id: null,
        quantity: values.quantity,
        picture: pictureUrl || firstVariant.picture || null,
      });
    }

    const payload = {
      product_name: values.product_name,
      category_id: values.category_id,
      product_detail: values.product_detail,
      product_price: values.product_price,
      minimum: values.minimum,
      concert_id: values.concert_id || null,
      quantity: values.quantity || null,
      staff_id: user?.id,
      variants: payloadVariants,
    };

    await productsAPI.update(editingProduct.ID, payload);
    messageApi.success("อัปเดตสินค้าสำเร็จ");
    setOpen(false);
    onGetInitialData();
  } catch (err) {
    messageApi.error("ไม่สามารถอัปเดตสินค้าได้");
  }
};


  const filteredData = products.filter((item) =>
    (item.product_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const columns  = [
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      width: 500,
    },
    {
      title: "Category",
      dataIndex:["category", "category"],
      key: "category",
    },
    {
      title: "Price",
      dataIndex: "product_price",
      key: "product_price",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Minimum Quantity",
      dataIndex: "minimum",
      key: "minimum",
      width:200,
    },
    {
      title: "Action",
      key: "actions",
      width:50,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            style={{ backgroundColor: "#1677ff", color: "white" }}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบ?"
            onConfirm={() => handleDelete(record.ID)} 
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <SidebarLayout>
    <div style={{ padding: 10 ,height:"100%" }}>
      <Row gutter={[50, 20]} align="middle">
        <Col span={12}>
          <Title level={3}>Edit Product Information</Title>
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: "#A4A4A4" }}
            onClick={ () => navigate("/warehouse/create")}
            >
            New Merchandise
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
        loading={loading}
        rowKey="ID"
        style={{width:"90%",margin:"20px auto",textAlign:"center"}}
      />

      {/* ✅ Modal ฟอร์มแก้ไข */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleUpdate}
        title="แก้ไขข้อมูลสินค้า"
        okText="บันทึก"
        cancelText="ยกเลิก"
        width={"50%"}
        >
        <Form layout="vertical" form={form}>
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
                  <Form.Item label="Concert" name="concert_id">
                    <Select placeholder="เลือกคอนเสิร์ต">
                      {concerts.map((c) => (
                        <Option key={c.ID} value={c.ID}>
                          {c.concert}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Row gutter={[40, 40]}>
                  <Col span={8}>
                    <Form.Item
                      label="Category"
                      name="category_id" 
                      rules={[{ required: true, message: "กรุณาเลือกหมวดหมู่" }]}
                    >
                      <Select placeholder="เลือกประเภทสินค้า">
                        {categories.map((cat) => (
                          <Option key={cat.ID} value={cat.ID}>
                            {cat.category}
                          </Option>
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
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="เช่น 100"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Minimum Quantity"
                      name="minimum"
                      rules={[{ required: true, message: "กรุณากรอกจำนวนขั้นต่ำ" }]}
                      >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="เช่น 50"
                        />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col style={{ marginLeft: "2.5%", width: "45%" }}>
                <Form.Item
                  label="Product Detail"
                  name="product_detail"
                  rules={[{ required: true, message: "กรุณากรอกรายละเอียดสินค้า" }]}
                  >
                  <Input.TextArea
                    placeholder="เช่น เนื้อผ้า cotton 100%"
                    style={{ minHeight: "205px" }}
                    />
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
                      extra={
                        fields.length > 1 && (
                          <Popconfirm
                          title="คุณแน่ใจหรือไม่ที่จะลบ?"
                          onConfirm={async () => {
                            // if (variant?.IDs?.[0]) {
                              // await handleDeleteVariant(variant.IDs[0]); // ลบจาก backend
                              // }
                              remove(name); // ลบจาก UI
                            }}
                            >
                              <Button danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          )
                        }
                        >
                        {/* Select Color */}
                        <Form.Item
                          {...restField}
                          label="Product Color"
                          name={[name, "color"]}
                          rules={[{ required: true, message: "กรุณาเลือกสีสินค้า" }]}
                          >
                          <Select placeholder="Select color">
                            {colors.map((c) => (
                              <Option key={c.ID} value={c.ID}>
                                {c.color}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Row
                          gutter={16}
                          style={{
                            border: "1px solid #ccc",
                            padding: 16,
                            borderRadius: 10,
                          }}
                          >


                          {/* Upload Image */}
                          <Col span={10} style={{ textAlign: "center" }}>
                            <Form.Item
                              {...restField}
                              label="Product Picture"
                              name={[name, "picture"]}
                              valuePropName="fileList"
                              getValueFromEvent={(e: any) => {
                                if (Array.isArray(e)) return e;
                                return e?.fileList ?? [];
                              }}
                              rules={[
                                { required: true, message: "กรุณาอัปโหลดรูปสินค้า" },
                              ]}
                              >
                              <Upload
                                listType="picture-card"
                                maxCount={1}
                                beforeUpload={() => false}
                                style={{
                                  width: "210px",
                                  height: "240px",
                                  margin: "0 auto",
                                }}
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
                              <Col
                                span={12}
                                style={{
                                  textAlign: "center",
                                  fontWeight: "bold",
                                }}
                                >
                                Size
                              </Col>
                              <Col
                                span={12}
                                style={{
                                  textAlign: "center",
                                  fontWeight: "bold",
                                }}
                                >
                                Quantity
                              </Col>
                            </Row>
                            {sizes.map((sizeItem) => (
                              <Row
                              key={`${sizeItem.id}`}
                              align="middle"
                              gutter={16}
                              style={{ margin: 8 }}
                              >
                                <Col
                                  span={12}
                                  style={{ display: "flex", justifyContent: "center" }}
                                  >
                                  <Button disabled style={{ width: "80%" }}>
                                    {sizeItem.size}
                                  </Button>
                                </Col>
                                <Col
                                  span={12}
                                  style={{ display: "flex", justifyContent: "center" }}
                                  >
                                  <Form.Item
                                    name={[name, "sizes", sizeItem.id]}
                                    // initialValue={0}
                                    style={{ marginBottom: 0, width: "80%" }}
                                    >
                                    <InputNumber 
                                      min={0} 
                                      style={{ width: "100%" }} 
                                      />
                                  </Form.Item>
                                </Col>
                              </Row>
                            ))}
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        >
                        เพิ่มสีสินค้าใหม่
                      </Button>
                    </Form.Item>
                  </div>
                )}
              </Form.List>
            </div>
          )}

          {/* Quantity + Picture for other categories */}
          {category && ![1, 3].includes(category) && (
            <div style={{ margin:"0 auto",width:"100%"}}>
              <Row justify="center" gutter={32} style={{ width: "100%", marginTop: 16 }}>
                <Col span={8}>
                  <Form.Item
                    label="Quantity"
                    name="quantity"
                    rules={[{ required: true, message: "กรุณากรอกจำนวนสินค้า" }]}
                    >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>

                <Col span={8} style={{ textAlign: "center" }}>
                  <Form.Item
                    label="Product Picture"
                    name="picture"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                    rules={[{ required: true, message: "กรุณาอัปโหลดรูปสินค้า" }]}
                    >
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={() => false}
                      >
                      <div>
                        <UploadOutlined />
                        <div>Upload</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

            </div>
          )}
        </Form>
        {contextHolder}
        </Modal>
        </div>
    </SidebarLayout>
  );
};

export default EditWarehouse;