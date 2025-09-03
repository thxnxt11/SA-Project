import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Form,
  Row,
  Col,
  Select,
  Upload,
  Card,
  notification,
  message,
} from "antd";
import { UploadOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { useNavigate } from "react-router-dom";
import type { UploadFile, UploadProps } from "antd";
import { createReport, getReportTypes } from "../../../api/reportt";
import type { ReportType } from "../../../interface/reportinter";

const { TextArea } = Input;

const ReportForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  // Fetch report types on component mount
  useEffect(() => {
    fetchReportTypes();
  }, []);

  const fetchReportTypes = async () => {
    setLoadingTypes(true);
    try {
      const types = await getReportTypes();
      setReportTypes(types);
    } catch (error) {
      message.error("ไม่สามารถโหลดประเภทรายงานได้");
      console.error("Error fetching report types:", error);
    } finally {
      setLoadingTypes(false);
    }
  };

  const goToHistory = () => navigate("/historyreport");

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      // ตรวจสอบประเภทไฟล์
      const isImage = file.type?.startsWith("image/");
      if (!isImage) {
        message.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น!");
        return Upload.LIST_IGNORE;
      }

      // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("ขนาดไฟล์ต้องไม่เกิน 5MB!");
        return Upload.LIST_IGNORE;
      }

      setFileList([file]); // เก็บไฟล์เดียว
      return false; // หยุดไม่ให้อัปโหลดอัตโนมัติ
    },
    onRemove: () => setFileList([]),
    fileList,
    maxCount: 1,
  };

  const onFinish = async (values: any) => {
    setLoading(true);

    console.log("Form values:", values);
    console.log("Selected file:", fileList);
    try {
      // เตรียมข้อมูลสำหรับส่ง FormData
      const reportData = {
        topic: values.topic,
        description: values.description,
        report_type_id: values.report_type_id,
        members_id: 1, // default หรือจาก user context
        photo:
          fileList.length > 0 ? (fileList[0].originFileObj as File) : undefined,
      };

      console.log("Submitting report with file:", reportData);

      await createReport(reportData);

      api.success({
        message: "สำเร็จ",
        description: "ส่งรายงาน/ความคิดเห็นของคุณเรียบร้อยแล้ว!",
        placement: "top",
        icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
      });

      form.resetFields();
      setFileList([]);
    } catch (error: any) {
      console.error("Submit error:", error);
      api.error({
        message: "เกิดข้อผิดพลาด",
        description:
          error.message ||
          error.response?.data?.error ||
          "ไม่สามารถส่งรายงานของคุณได้",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      {contextHolder}
      <Row
        gutter={32}
        style={{
          width: 1300,
          margin: "20px auto",
          marginLeft: 120,
          
        }}
      >
        <Title level={2}>Report & Feedback</Title>
        <Button
          type="primary"
          style={{
            width: 150,
            height: 40,
            backgroundColor: "#00306E",
            color: "#ffffff",
            fontSize: 18,
            marginLeft: "auto",
          }}
          onClick={goToHistory}
        >
          History
        </Button>
      </Row>

      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        style={{ maxWidth: 1300, margin: "0 auto 20px auto" }}
      >
        <Card style={{ borderRadius: 10, height: 400 }}>
          <Row gutter={32}>
            <Col span={12} style={{ marginTop: 40 }}>
              <Form.Item
                name="report_type_id"
                label={<span>Select Type</span>}
                rules={[{ required: true, message: "กรุณาเลือกประเภท" }]}
              >
                <Select
                  showSearch
                  placeholder="เลือกประเภท"
                  optionFilterProp="label"
                  style={{ height: 50 }}
                  loading={loadingTypes}
                  options={reportTypes.map((type) => ({
                    value: type.ID,
                    label: type.type_name,
                  }))}
                  filterSort={(a, b) =>
                    (a?.label ?? "")
                      .toLowerCase()
                      .localeCompare((b?.label ?? "").toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                name="topic"
                label={<span>Topic</span>}
                rules={[{ required: true, message: "กรุณาระบุหัวข้อ" }]}
              >
                <Input style={{ height: 45 }} placeholder="ระบุหัวข้อ" />
              </Form.Item>

              <Form.Item label="อัปโหลดรูปภาพ">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>
                    คลิกเพื่ออัปโหลดรูป
                    {fileList.length > 0 && " (1 ไฟล์)"}
                  </Button>
                </Upload>
                {fileList.length > 0 && (
                  <div style={{ marginTop: 8, color: "#666" }}>
                    ไฟล์ที่เลือก: {fileList[0].name}
                  </div>
                )}
              </Form.Item>
            </Col>

            <Col span={12} style={{ marginTop: 35 }}>
              <Form.Item
                name="description"
                label={<span>Description</span>}
                rules={[{ required: true, message: "กรุณาระบุรายละเอียด" }]}
              >
                <TextArea
                  maxLength={255}
                  showCount
                  style={{ height: 200, resize: "none" }}
                  placeholder="อธิบายปัญหาหรือข้อเสนอแนะของคุณ..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div style={{ textAlign: "center", margin: 30 }}>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: 150,
                height: 40,
                backgroundColor: "#00306E",
                color: "#ffffff",
                fontSize: 18,
              }}
            >
              ส่ง
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default ReportForm;
