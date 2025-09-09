import React, { useEffect } from "react";
import { Modal, Form, Input, Select, InputNumber, message } from "antd";


const { Option } = Select;
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
interface EditEquipmentModalProps {
  visible: boolean;
  equipment: Equipment | null;
  onClose: () => void;
  onSave: (updatedEquipment: Equipment) => void;
}

const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({
  visible,
  equipment,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (equipment) {
      form.setFieldsValue({
        name: equipment.name,
        equipment_type: equipment.equipment_type,
        location: equipment.location === "-" ? "" : equipment.location,
        stage_name: equipment.stage_name === "-" ? "" : equipment.stage_name,
        totalQuantity: equipment.totalQuantity,
        usedQuantity: equipment.usedQuantity,
        remainingQuantity: equipment.remainingQuantity,
      });
    }
  }, [equipment, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (!equipment) return;
        const updated: Equipment = {
          ...equipment,
          ...values,
          location: values.location || "-",
          stage_name: values.stage_name || "-",
        };
        onSave(updated);
        message.success("แก้ไขอุปกรณ์เรียบร้อยแล้ว");
        onClose();
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title="แก้ไขอุปกรณ์"
      visible={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText="บันทึก"
      cancelText="ยกเลิก"
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
          <Select placeholder="เลือกประเภท">
            <Option value="เครื่องเสียง">เครื่องเสียง</Option>
            <Option value="แสงไฟ">แสงไฟ</Option>
            <Option value="จอแสดงผล">จอแสดงผล</Option>
          </Select>
        </Form.Item>

        <Form.Item label="สถานที่" name="location">
          <Input placeholder="ระบุสถานที่ (ไม่บังคับ)" />
        </Form.Item>

        <Form.Item label="เวที" name="stage_name">
          <Input placeholder="ระบุเวที (ไม่บังคับ)" />
        </Form.Item>

        <Form.Item
          label="จำนวนทั้งหมด"
          name="totalQuantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวนทั้งหมด" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="จำนวนที่ใช้งาน"
          name="usedQuantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวนที่ใช้งาน" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="จำนวนที่เหลือ"
          name="remainingQuantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวนที่เหลือ" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditEquipmentModal;
