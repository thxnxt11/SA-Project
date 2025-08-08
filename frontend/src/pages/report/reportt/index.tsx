import Card from "antd/es/card/Card";
import { Col, Form, Row, Select } from "antd";
import { Button, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useNavigate } from "react-router-dom";
const { TextArea } = Input;


const Report = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const goToHistory = () => {
    navigate("/historyreport")
  }
  return (
    <>
      <div
        style={{
          width: 1300,
          margin: "20px auto 0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2} style={{ left: 100 }}>
          Report & Feedback
        </Title>
        <Button
          style={{
            width: 150,
            height: 40,
            marginBottom: 20,
            backgroundColor: "#00306E",
            color: "#ffffff",
            fontSize: 18,
          }}
          onClick={goToHistory}
        >
          History
        </Button>
      </div>
      <Form
        layout="vertical"
        form={form}
        style={{ width: 1300, margin: "0 auto", marginTop: 20 }}
      >
        <Card style={{ borderRadius: 10, height: 400, width: 1300 }}>
          <Row gutter={32}>
            <Col span={12} style={{ marginTop: 50 }}>
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

        <div style={{ textAlign: "center", marginTop: 30 }}>
          <Form.Item>
            <Button
              htmlType="submit"
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
    </>
  );
};
export default Report;
