// EditZoneForm.tsx
import React from "react";
import { Form, Input, InputNumber, Select } from "antd";
import type { ZoneInterface } from "../../../interface/zone";

type Option = { value: number | string; label: string };

export interface EditZoneFormProps {
  venueOptions: Option[];
  zoneTypeOptions: Option[];
  initialValues?: Partial<ZoneInterface>;
  form: ReturnType<typeof Form.useForm>[0];
}

const EditZoneForm: React.FC<EditZoneFormProps> = ({
  venueOptions,
  initialValues,
  form,
}) => {
  const formInitial = {
    ...initialValues,
    venue_id:
      (initialValues as any)?.venue_id ??
      (initialValues as any)?.venue?.id ??
      undefined,
  };

  const selectedZoneTypeId = Form.useWatch("zonetype_id", form);

  return (
    <Form layout="vertical" form={form} requiredMark={false} initialValues={formInitial}>
      <Form.Item
        label="Venue"
        name="venue_id"
        rules={[{ required: true, message: "Please select a venue" }]}
      >
        <Select options={venueOptions} placeholder="Select venue" showSearch optionFilterProp="label" />
      </Form.Item>

      <Form.Item
        label="Zone name"
        name="zone_name"
        rules={[{ required: true, message: "zone_name is required" }]}
      >
        <Input placeholder="VIP A, Standing, etc." />
      </Form.Item>


      <Form.Item name="zonetype_id" preserve noStyle>
      <input type="hidden" />
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
        <InputNumber style={{ width: "100%" }} min={0} disabled={selectedZoneTypeId === 2} />
        {selectedZoneTypeId == 2 &&(
          <p> capacity cant be change here if zone type is seat</p>
        )}
      </Form.Item>
    </Form>
  );
};

export default EditZoneForm;
