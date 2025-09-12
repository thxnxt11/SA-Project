/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, message, Spin } from "antd";
import type { EquipmentInterface, EquipmentTypeInterface } from "../../../interface/equipment";

import { equipmentAPI } from "../../../services/https";

const { Option } = Select;

interface AddEquipmentModalProps {
  open: boolean;
  onCancel: () => void;
  onAdd?: (equipment: EquipmentInterface) => void; // callback ถ้าอยากอัปเดต UI
}

const AddEquipment: React.FC<AddEquipmentModalProps> = ({
  open,
  onCancel,
  onAdd,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [equipmentTypes, setEquipmentTypes] = useState<
    EquipmentTypeInterface[]
  >([]);
  const [typesLoading, setTypesLoading] = useState(false);

  // ----------- Fetch Equipment Types -----------
  const fetchEquipmentTypes = async () => {
    setTypesLoading(true);
    try {
      const res = await equipmentAPI.getEquipmentTypes();
      setEquipmentTypes(res.data || []);
    } catch (err) {
      message.error("โหลดประเภทอุปกรณ์ล้มเหลว");
      console.error(err);
    } finally {
      setTypesLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchEquipmentTypes();
  }, [open]);

  // ----------- Add Equipment -----------
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const selectedType = equipmentTypes.find(
        (t) => t.ID === Number(values.equipment_type)
      );
      if (!selectedType) {
        message.error("ประเภทอุปกรณ์ไม่ถูกต้อง");
        return;
      }

      const payload: EquipmentInterface = {
        equipment_name: values.name,
        total_quantity: Number(values.totalQuantity),
        remaining_quantity: Number(values.totalQuantity),
        used_quantity: 0,
        equipment_type: selectedType,
      };

      console.log(payload);
      setLoading(true);
      const res = await equipmentAPI.create(payload);
      message.success("เพิ่มอุปกรณ์เรียบร้อย");

      if (onAdd) onAdd(res.data); // อัปเดต UI
      form.resetFields();
      onCancel();
    } catch (err: any) {
      message.error(err.message || "เพิ่มอุปกรณ์ล้มเหลว");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="เพิ่มอุปกรณ์ใหม่"
      open={open}
      onOk={handleSubmit}
      confirmLoading={loading}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
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
          {typesLoading ? (
            <Spin />
          ) : (
            <Select placeholder="เลือกประเภทอุปกรณ์">
              {equipmentTypes.map((type) => (
                <Option key={type.ID} value={type.ID}>
                  {type.equipment_type}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          label="จำนวนทั้งหมด"
          name="totalQuantity"
          rules={[{ required: true, message: "กรุณากรอกจำนวนทั้งหมด" }]}
        >
          <Input type="number" min={1} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEquipment;
