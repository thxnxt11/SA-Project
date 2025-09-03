import { Button, Card, DatePicker, Form, Row, Select } from "antd";
import Title from "antd/es/typography/Title";
import dayjs from "dayjs";
import { Input } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

const onChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  console.log("Change:", e.target.value);
};

dayjs.extend(customParseFormat);

const dateFormat = "YYYY-MM-DD";

export const Refund = () => {
  const [form] = Form.useForm();
  const navigatee = useNavigate();

  const goToHistoryy = () => {
    navigatee("/historyrefund");
  };
  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      <Row
        style={{
          width: 1300,
          margin: "20px auto 0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2}>Refund</Title>
        <Button
          type="primary"
          style={{
            width: 150,
            height: 40,
            marginBottom: 20,
            backgroundColor: "#00306E",
            color: "#ffffff",
            fontSize: 18,
          }}
          onClick={goToHistoryy}
        >
          History
        </Button>
      </Row>

      <Form
        onFinish={(values) => {
          console.log("Refund Form Submitted:", values);
        }}
        layout="vertical"
        form={form}
        style={{ width: 1300, margin: "0 auto" }}
      >
        <Card style={{ borderRadius: 10, height: 600 }}>
          <Row style={{ marginLeft: 100 }}>
            <Form.Item
              name="BookingID"
              label="BookingID"
              layout="vertical"
              rules={[{ required: true }]}
            >
              <Input style={{ width: 500, height: 40 }} />
            </Form.Item>
            <Row>
              <Form.Item
                name="FirstName"
                label="FirstName"
                layout="vertical"
                rules={[{ required: true }]}
              >
                <Input style={{ width: 500, height: 40 }} />
              </Form.Item>
              <Form.Item
                name="LastName"
                label="LastName"
                layout="vertical"
                rules={[{ required: true }]}
                style={{ marginLeft: 40 }}
              >
                <Input style={{ width: 500, height: 40 }} />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item
                name="Consume"
                label="Consume"
                layout="vertical"
                rules={[{ required: true }]}
              >
                <DatePicker
                  defaultValue={dayjs("0000-00-00", dateFormat)}
                  style={{ width: 500, height: 40 }}
                />
              </Form.Item>
            </Row>
            <Row>
              <Form.Item
                name="Bank"
                label="Bank"
                layout="vertical"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  style={{ width: 500, height: 40 }}
                  placeholder="Search to Select"
                  optionFilterProp="label"
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? "")
                      .toLowerCase()
                      .localeCompare((optionB?.label ?? "").toLowerCase())
                  }
                  options={[
                    {
                      value: "1",
                      label: "KMA",
                    },
                    {
                      value: "2",
                      label: "KTB",
                    },
                    {
                      value: "3",
                      label: "SCB",
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="Bank Number"
                label="Bank Number"
                layout="vertical"
                rules={[{ required: true }]}
                style={{ marginLeft: 40 }}
              >
                <TextArea
                  showCount
                  maxLength={20}
                  minLength={10}
                  onChange={onChange}
                  style={{ width: 500, height: 40 }}
                />
              </Form.Item>
            </Row>
            <Form.Item
              name="Reason"
              label="Reason"
              layout="vertical"
              rules={[{ required: true }]}
            >
              <TextArea
                showCount
                maxLength={500}
                onChange={onChange}
                style={{ width: 1045, height: 90 }}
              />
            </Form.Item>
          </Row>
        </Card>
        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              width: 150,
              margin: 30,
              height: 40,
              backgroundColor: "#00306E",
              color: "#ffffff",
              fontSize: 18,
            }}
          >
            Send
          </Button>
        </div>
      </Form>
    </div>
  );
};
