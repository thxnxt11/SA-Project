// src/pages/concert/edit/consert.tsx
import React from "react";
import { Form, Input, DatePicker, Button, Space, Card } from "antd";
import type { ConcertInterface } from "../../../../interface/concert";
import VenueSelect from "../venue";
import dayjs from "dayjs";

interface AddConcertFormProps {
  initialValues?: Partial<ConcertInterface>;
  onFinish: (values: any) => void; // parent handles normalization
}

const AddConcertForm: React.FC<AddConcertFormProps> = ({ initialValues, onFinish }) => {
  const [form] = Form.useForm();

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish} 
      requiredMark={false}
      initialValues={{
        ...initialValues,
        onsale_date: initialValues?.onsale_date ? dayjs(initialValues.onsale_date) : undefined,
        offsale_date: initialValues?.offsale_date ? dayjs(initialValues.offsale_date) : undefined,
      }}
    >
      <Form.Item label="Concert Name" name="concert_name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Artist" name="artist" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="On sale" name="onsale_date" rules={[{ required: true }]}>
        <DatePicker showTime={{ format: "HH:mm" }} style={{ width: "100%" }} format="YYYY-MM-DD HH:mm" />
      </Form.Item>

      <Form.Item label="Off sale" name="offsale_date" rules={[{ required: true }]}>
        <DatePicker showTime={{ format: "HH:mm" }} style={{ width: "100%" }} format="YYYY-MM-DD HH:mm" />
      </Form.Item>

      {/* your global venue selector (if your VenueSelect wraps its own Form.Item) */}
      <VenueSelect />

      <Form.Item label="Poster URL" name="concert_poster_url" rules={[{ required: true }]}>
        <Input placeholder="https://example.com/poster.jpg" />
      </Form.Item>

      <Card size="small" style={{ marginTop: 8, marginBottom: 16 }} title="Show time">
              <Form.Item
                label="Start time"
                name="show_start_time"
                rules={[{ required: true, message: "Please select start time" }]}
              >
                <DatePicker showTime={{ format: "HH:mm" }} style={{ width: "100%" }} format="YYYY-MM-DD HH:mm" />
              </Form.Item>

              <Form.Item label="End time" name="show_end_time">
                <DatePicker showTime={{ format: "HH:mm" }} style={{ width: "100%" }} format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            </Card>


      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large">
          Add Concert
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddConcertForm;
