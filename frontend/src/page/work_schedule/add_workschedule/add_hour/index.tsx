import React from "react";
import { Modal, Form, Input, TimePicker, Col, Row } from "antd";
import { Dayjs } from "dayjs";

interface AddHourProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (data: {
    title: string;
    description: string;
    start: Dayjs;
    end: Dayjs;
  }) => void;
}

const AddHour: React.FC<AddHourProps> = ({ visible, onCancel, onAdd }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onAdd({
        title: values.title,
        description: values.description,
        start: values.start,
        end: values.end,
      });
      form.resetFields();
    });
  };

  return (
    <Modal
      open={visible}
      title="เพิ่มช่วงเวลาใหม่"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText="บันทึกช่วงเวลา"
      cancelText="ยกเลิก"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="หัวข้อ" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="รายละเอียด">
          <Input.TextArea />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="start"
              label="เวลาเริ่ม"
              rules={[{ required: true, message: "กรุณาเลือกเวลาเริ่ม" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="end"
              label="เวลาสิ้นสุด"
              rules={[{ required: true, message: "กรุณาเลือกเวลาสิ้นสุด" }]}
            >
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddHour;
