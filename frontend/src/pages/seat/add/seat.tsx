// src/pages/zones/AddZoneForm.tsx
import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select, Button, Modal } from "antd";
import type { ZoneInterface } from "../../../interface/zone";

type Option = { value: number | string; label: string };

interface AddZoneFormProps {
  showdateId: number | string;
  venueOptions: Option[];
  zoneTypeOptions: Option[];
  initialValues?: Partial<ZoneInterface>;
  onFinish: (values: any) => void;
  /** ถ้าส่งมา จะ set ค่า venue อัตโนมัติและล็อกช่องไว้ */
  fixedVenueId?: number;
}

const AddZoneForm: React.FC<AddZoneFormProps> = ({
  showdateId,
  venueOptions,
  zoneTypeOptions,
  initialValues,
  onFinish,
  fixedVenueId,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const payload = {
      ...values,
      showdate_id: showdateId, // inject showdateId
      // ถ้ามี fixedVenueId ให้ override (กันพลาด)
      venue_id: fixedVenueId ?? values.venue_id,
      seat_sold: values?.seat_sold ?? 0,
      pending_hold: values?.pending_hold ?? 0,
    };
    onFinish(payload);
  };

  // if zonetype = seat set default capacity & warning
  const zonetype = Form.useWatch("zonetype_id", form);
  useEffect(() => {
    if (zonetype === 2) {
      form.setFieldsValue({ capacity: 195 });
      Modal.warning({
        title: "You selected zone type = Seat",
        content:
          "If you select zone type as seat, you can manage the seat map later using the 3rd button from the left.",
        okText: "OK",
      });
    }
  }, [zonetype, form]);

  // set venue ตาม fixedVenueId ทันทีที่เปิดฟอร์ม/ค่าเปลี่ยน
  useEffect(() => {
    if (fixedVenueId != null) {
      form.setFieldsValue({ venue_id: fixedVenueId });
    }
  }, [fixedVenueId, form]);

  return (
    <Form
      layout="vertical"
      form={form}
      requiredMark={false}
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      <Form.Item
        label="Venue"
        name="venue_id"
        rules={[{ required: true, message: "Please select a venue" }]}
      >
        <Select
          options={venueOptions}
          placeholder="Select venue"
          showSearch
          optionFilterProp="label"
          disabled={fixedVenueId != null} // ล็อกถ้ามี fixedVenueId
        />
      </Form.Item>

      <Form.Item
        label="Zone name"
        name="zone_name"
        rules={[{ required: true, message: "zone_name is required" }]}
      >
        <Input placeholder="VIP A, Standing, etc." />
      </Form.Item>

      <Form.Item
        label="Zone type"
        name="zonetype_id"
        rules={[{ required: true, message: "Please select zone type" }]}
      >
        <Select
          options={zoneTypeOptions}
          placeholder="Select zone type"
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      <Form.Item
        label="Zone price"
        name="zone_price"
        rules={[{ required: true, message: "zone_price is required" }]}
      >
        <InputNumber style={{ width: "100%" }} min={0} />
      </Form.Item>

      <Form.Item
        label="Capacity"
        name="capacity"
        rules={[{ required: true, message: "capacity is required" }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          disabled={zonetype === 2}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Add Zone
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddZoneForm;
