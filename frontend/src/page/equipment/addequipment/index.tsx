import React from "react";
import { Modal, Form, Input, Select } from "antd";

export interface Equipment {
  id: number;
  name: string;
  equipment_type: string;
  location: string;
  stage_name: string;
  totalQuantity: number;
  remainingQuantity: number;
  usedQuantity: number;
}

const { Option } = Select;

interface AddEquipmentModalProps {
  open: boolean;
  onCancel: () => void;
  onAdd: (equipment: Equipment) => void;
  nextId: number;
}

const AddEquipment: React.FC<AddEquipmentModalProps> = ({ open, onCancel, onAdd, nextId }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(values => {
      const newEquipment: Equipment = {
        id: nextId,
        name: values.name,
        equipment_type: values.equipment_type,
        location: values.location || "-",
        stage_name: values.stage_name || "-",
        totalQuantity: values.totalQuantity,
        usedQuantity: 0,
        remainingQuantity: values.totalQuantity,
      };
      onAdd(newEquipment);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="เพิ่มอุปกรณ์ใหม่"
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onCancel(); }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="ชื่ออุปกรณ์"
          name="name"
          rules={[{ required: true, message: "กรุณากรอกชื่ออุปกรณ์" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="ประเภทอุปกรณ์"
          name="equipment_type"
          rules={[{ required: true, message: "กรุณาเลือกประเภทอุปกรณ์" }]}
        >
          <Select>
            <Option value="เครื่องเสียง">เครื่องเสียง</Option>
            <Option value="แสงไฟ">แสงไฟ</Option>
            <Option value="จอแสดงผล">จอแสดงผล</Option>
          </Select>
        </Form.Item>
        <Form.Item label="สถานที่" name="location">
          <Input placeholder="ไม่ระบุ = -" />
        </Form.Item>
        <Form.Item label="เวที" name="stage_name">
          <Input placeholder="ไม่ระบุ = -" />
        </Form.Item>
        <Form.Item
          label="จำนวนทั้งหมด"
          name="totalQuantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวนทั้งหมด" }]}
        >
          <Input type="number" min={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEquipment;
