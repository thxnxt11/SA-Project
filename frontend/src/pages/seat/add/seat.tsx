// src/pages/zones/AddZoneForm.tsx
import React from "react";
import { Form, Input, InputNumber, Select, Button } from "antd";
import type { ZoneInterface } from "../../../interface/zone";

type Option = { value: number | string; label: string };

interface AddZoneFormProps {

  showdateId: number | string;


  venueOptions: Option[];
  zoneTypeOptions: Option[];

  initialValues?: Partial<ZoneInterface>;


  onFinish: (values: any) => void;
}

const AddZoneForm: React.FC<AddZoneFormProps> = ({
  showdateId,
  venueOptions,
  zoneTypeOptions,
  initialValues,
  onFinish,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const payload = {
      ...values,
      showdate_id: showdateId,        // inject showdateId
      seat_sold: values?.seat_sold ?? 0,
      pending_hold: values?.pending_hold ?? 0,
    };
    onFinish(payload);
  };

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
        <InputNumber style={{ width: "100%" }} min={0} />
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
