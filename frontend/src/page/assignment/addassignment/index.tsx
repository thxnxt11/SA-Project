import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

type TaskAssignmentFormProps = {
  visible: boolean;
  onCancel: () => void;
};

const AddTaskAssignment: React.FC<TaskAssignmentFormProps> = ({
  visible,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    console.log("Submitted values:");
  };

  return (
    <Modal
      title="มอบหมายงานใหม่"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="มอบหมายงาน"
      cancelText="ยกเลิก"
      width={800} // กำหนดความกว้างให้เพียงพอ
    >
      <p>สร้างและมอบหมายงานใหม่ให้กับทีมงาน</p>

      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{
          deadlineTime: dayjs("02:54", "HH:mm"),
          deadlineDate: dayjs("2025-08-17", "YYYY-MM-DD"),
          workingHours: 1,
          priority: "กลาง",
          category: "เวที",
          project: "คอนเสิร์ตดนตรีคลาสสิก",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ชื่องาน"
              name="title"
              rules={[{ required: true, message: "กรุณากรอกชื่องาน" }]}
            >
              <Input placeholder="ชื่องาน" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="คอนเสิร์ต"
              name="project"
              rules={[{ required: true, message: "กรุณาเลือกคอนเสิร์ต" }]}
            >
              <Select>
                <Option value="คอนเสิร์ตดนตรีคลาสสิก">
                  คอนเสิร์ตดนตรีคลาสสิก
                </Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="หมวดหมู่" name="category">
              <Select>
                <Option value="เวที">เวที</Option>
                <Option value="แสง">แสง</Option>
                <Option value="เสียง">เสียง</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="มอบหมายให้" name="assignee">
              <Select placeholder="เลือกพนักงาน">
                <Option value="พนักงาน1">พนักงาน 1</Option>
                <Option value="พนักงาน2">พนักงาน 2</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="วันที่กำหนดส่ง" name="deadlineDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="เวลากำหนดส่ง" name="deadlineTime">
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="รายละเอียด" name="details">
              <TextArea rows={3} placeholder="รายละเอียดงาน" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddTaskAssignment;
