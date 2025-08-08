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
  const navigatee = useNavigate();

  const goToHistoryy = () => {
    navigatee("/historyrefund");
  };
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
        <Title level={2}>Refund</Title>
        <Button
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
      </div>

      <Form
        onFinish={(values) => {
          console.log("Refund Form Submitted:", values);
        }}
      >
        <Card
          style={{
            height: 550,
            width: 1300,
            marginTop: 10,
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div style={{ marginLeft: 100 }}>
            <Form.Item
              name="Booking ID"
              label="BookingID"
              layout="vertical"
              rules={[{ required: true }]}
              style={{ marginTop: 20 }}
            >
              <Input style={{ width: 500, height: 40 }} />
            </Form.Item>
            <Row style={{ marginTop: 80 }}>
              <Form.Item
                name="User ID"
                label="UserID"
                layout="vertical"
                rules={[{ required: true }]}
              >
                <Input style={{ width: 500, height: 40 }} />
              </Form.Item>
              <Form.Item
                name="Consume"
                label="Consume"
                layout="vertical"
                rules={[{ required: true }]}
                style={{ marginLeft: 40 }}
              >
                <DatePicker
                  defaultValue={dayjs("0000-00-00", dateFormat)}
                  style={{ width: 500, height: 40 }}
                />
              </Form.Item>
            </Row>
            <Row style={{ marginTop: 50 }}>
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
              style={{ marginTop: 50 }}
            >
              <TextArea
                showCount
                maxLength={500}
                onChange={onChange}
                style={{ width: 1045, height: 90 }}
              />
            </Form.Item>
          </div>
        </Card>
        <div style={{ textAlign: "center" }}>
          <Button
            htmlType="submit"
            style={{
              width: 150,
              marginTop: 600,
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
    </>
  );
};
