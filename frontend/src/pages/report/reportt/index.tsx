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
} from "antd";
import { UploadOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import Title from "antd/es/typography/Title";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { UploadProps } from "antd";

const { TextArea } = Input;

const props: UploadProps = {
  name: "file",
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
  headers: { authorization: "authorization-text" },
  onChange(info) {
    if (info.file.status === "done") {
      notification.success({
        message: `${info.file.name} uploaded successfully`,
      });
    } else if (info.file.status === "error") {
      notification.error({ message: `${info.file.name} upload failed` });
    }
  },
};

const Report = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  const goToHistory = () => navigate("/historyreport");

  const onFinish = (values: any) => {
    console.log("Form Submitted:", values);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      api.success({
        message: "Success",
        description: "Your report/feedback has been sent successfully!",
        placement: "top",
        icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
      });

      form.resetFields();
    }, 1000);
  };

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      {contextHolder}
      <Row
        style={{
          width: 1300,
          margin: "20px auto 0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
                name="type"
                label="Select Type"
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select
                  showSearch
                  placeholder="Search to Select"
                  optionFilterProp="label"
                  style={{ height: 50 }}
                  options={[
                    { value: "report", label: "Report" },
                    { value: "feedback", label: "Feedback" },
                  ]}
                  filterSort={(a, b) =>
                    (a?.label ?? "")
                      .toLowerCase()
                      .localeCompare((b?.label ?? "").toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                name="topic"
                label="Topic"
                rules={[{ required: true, message: "Please enter topic" }]}
              >
                <Input style={{ height: 45 }} />
              </Form.Item>

              <Form.Item
                name="file"
                label="Upload Picture"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
              >
                <Upload {...props}>
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={12} style={{ marginTop: 35 }}>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <TextArea
                  maxLength={255}
                  showCount
                  style={{ height: 200, resize: "none" }}
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
              Send
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default Report;
