// src/pages/zones/AddZoneForm.tsx
import React from "react";
import { Form, Input, InputNumber, Select, Button } from "antd";

type Option = { value: number; label: string };

interface AddZoneFormProps {
  // selected showdate from your ZoneBrowser (required)
  showdateId: number;

  // options you fetch in parent (e.g. /organizer/zonetype and /organizer/venues/option)
  zoneTypeOptions?: Option[];
  venueOptions?: Option[];

  // optional defaults
  initialValues?: {
    venue_id?: number;
    zonetype_id?: number;
    zone_name?: string;
    zone_price?: number;
    capacity?: number;
  };

  // parent will do the POST to /organizer/zone
  onFinish: (values: any) => void;
}

const AddZoneForm: React.FC<AddZoneFormProps> = ({
  showdateId,
  zoneTypeOptions = [],
  venueOptions = [],
  initialValues,
  onFinish,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const payload = {
      ...values,
      showdate_id: showdateId, // <- injected here
      seat_sold: 0,
      pending_hold: 0,
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
