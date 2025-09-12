/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, message, Spin } from "antd";

import { equipmentAPI } from "../../../services/https/index";
import type { EquipmentInterface } from "../../../interfaces/equipment";
import type { EquipmentTypeInterface } from "../../../interfaces/equipmenttype";

const { Option } = Select;

interface EditEquipmentModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (updatedEquipment: EquipmentInterface) => void;
  equipmentId: number | null;
}

const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({
  open,
  equipmentId,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [equipment, setEquipment] = useState<EquipmentInterface | null>(null);
  const [types, setTypes] = useState<EquipmentTypeInterface[]>([]);
  const [loading, setLoading] = useState(false);

  // โหลด equipment และ types เมื่อ modal เปิด
  useEffect(() => {
    if (open && equipmentId) {
      setLoading(true);

      const fetchTypes = equipmentAPI.getEquipmentTypes();
      const fetchEquipment = equipmentAPI.getById(equipmentId);


      Promise.all([fetchTypes, fetchEquipment])
        .then(([typeRes, eqRes]) => {
          setTypes(typeRes.data);
          setEquipment(eqRes.data);

          form.setFieldsValue({
            equipment_name: eqRes.data.equipment_name,
            equipment_type: eqRes.data.equipment_type?.ID || undefined,
            total_quantity: eqRes.data.total_quantity,
            used_quantity: eqRes.data.used_quantity,
            remaining_quantity: eqRes.data.remaining_quantity,
         
          });
        })
        .catch((err) => {
          console.error(err);
          message.error("ไม่สามารถโหลดข้อมูลอุปกรณ์หรือประเภทอุปกรณ์ได้");
        })
        .finally(() => setLoading(false));
    }
  }, [open, equipmentId, form]);

  // อัปเดต remaining_quantity อัตโนมัติเมื่อ total หรือ used เปลี่ยน
  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (
      "total_quantity" in changedValues ||
      "used_quantity" in changedValues
    ) {
      const total = allValues.total_quantity || 0;
      const used = allValues.used_quantity || 0;

      if (used > total) {
        form.setFields([
          {
            name: "used_quantity",
            errors: ["จำนวนที่ใช้งานไม่สามารถเกินจำนวนทั้งหมด"],
          },
        ]);
        form.setFieldsValue({ remaining_quantity: 0 });
      } else {
        form.setFields([{ name: "used_quantity", errors: [] }]);
        form.setFieldsValue({ remaining_quantity: total - used });
      }
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Edited Equiment:",values);
      if (!equipment) return;

      const updated: EquipmentInterface = {
        ...equipment,
        equipment_name: values.equipment_name,
        equipment_type: {
          ID: values.equipment_type,
          equipment_type:
            types.find((t) => t.ID === values.equipment_type)?.equipment_type ||
            "",
        },
        total_quantity: values.total_quantity,
        used_quantity: values.used_quantity,
        remaining_quantity: values.remaining_quantity,
        stage_equipments: equipment.stage_equipments,
      };

      await equipmentAPI.update(Number(equipment.ID), updated);

      message.success("แก้ไขอุปกรณ์เรียบร้อยแล้ว");
      onSave(updated);
      onCancel();
    } catch (err) {
      console.error(err);
      message.error("บันทึกไม่สำเร็จ");
    }
  };

  return (
    <Modal
      title="แก้ไขอุปกรณ์"
      visible={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="บันทึก"
      cancelText="ยกเลิก"
    >
      {loading ? (
        <Spin />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            label="ชื่ออุปกรณ์"
            name="equipment_name"
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
              {types.map((t) => (
                <Option key={t.ID} value={t.ID}>
                  {t.equipment_type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* <Form.Item label="สถานที่" name="location">
            <Input placeholder="ระบุสถานที่ (ไม่บังคับ)" />
          </Form.Item>

          <Form.Item label="เวที" name="stage_name">
            <Input placeholder="ระบุเวที (ไม่บังคับ)" />
          </Form.Item> */}

          <Form.Item
            label="จำนวนทั้งหมด"
            name="total_quantity"
            rules={[{ required: true, message: "กรุณากรอกจำนวนทั้งหมด" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="จำนวนที่ใช้งาน"
            name="used_quantity"
          
          >
            <InputNumber min={0} style={{ width: "100%" }} disabled />
          </Form.Item>

          <Form.Item
            label="จำนวนที่เหลือ"
            name="remaining_quantity"
           
          >
            <InputNumber min={0} style={{ width: "100%" }} disabled />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default EditEquipmentModal;
