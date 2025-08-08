import React from "react";
import { Modal, Form, Input, Select, InputNumber } from "antd";

interface AddTaskProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (data: {
    task_concert: string;
    description: string;
    assignment_hour: number;
    staff_ids: number[]; // เปลี่ยนจากชื่อเป็น id
  }) => void;
}

const AddTask: React.FC<AddTaskProps> = ({ visible, onCancel, onAdd }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Submitted:", values);
        onAdd(values);
        form.resetFields();
        onCancel();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title="เพิ่มงานคอนเสิร์ต"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="เพิ่ม"
      cancelText="ยกเลิก"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="task_concert"
          label="ชื่องาน"
          rules={[{ required: true, message: "กรุณากรอกชื่องาน" }]}
        >
          <Input placeholder="เช่น จัดการระบบเสียง" />
        </Form.Item>

        <Form.Item
          name="description"
          label="รายละเอียด"
          rules={[{ required: true, message: "กรุณากรอกรายละเอียดงาน" }]}
        >
          <Input.TextArea rows={3} placeholder="รายละเอียดของงานเพิ่มเติม" />
        </Form.Item>

        <Form.Item
          name="assignment_hour"
          label="ระยะเวลา (ชั่วโมง)"
          rules={[{ required: true, message: "กรุณากรอกระยะเวลา" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} placeholder="เช่น 2" />
        </Form.Item>

        <Form.Item
          name="staff_ids"
          label="เลือกทีมงานที่รับผิดชอบ"
          rules={[
            { required: true, message: "กรุณาเลือกทีมงานอย่างน้อย 1 คน" },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="เลือกทีมงาน"
            optionLabelProp="label"
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            <Select.Option value={101} label="สมชาย ใจดี">
              สมชาย ใจดี (Sound Engineer)
            </Select.Option>
            <Select.Option value={102} label="สมหญิง สวยงาม">
              สมหญิง สวยงาม (Stage Manager)
            </Select.Option>
            <Select.Option value={103} label="วิชัย มั่นคง">
              วิชัย มั่นคง (Lighting Tech)
            </Select.Option>
            <Select.Option value={104} label="นิตา ขยัน">
              นิตา ขยัน (Event Coordinator)
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTask;
