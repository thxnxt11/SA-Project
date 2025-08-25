// src/pages/concert/edit/consert.tsx
import React from "react";
import { Form, Input, DatePicker, Button } from "antd";
import moment from "moment";
import type { ConcertInterface } from "../../../../interface/concert";
import VenueSelect from "../venue";

interface AddConcertFormProps {
  initialValues: ConcertInterface;
  onFinish: (values: any) => void;
}

const AddConcertForm: React.FC<AddConcertFormProps> = ({ initialValues, onFinish }) => {
  const formInitial = {
    ...initialValues,

    venue_id:
    (initialValues as any)?.venue_id ??
    (initialValues as any)?.venue?.id ??
    undefined,

    onsale_date: initialValues.onsale_date
      ? moment(initialValues.onsale_date, "YYYY-MM-DD HH:mm")
      : undefined,
    offsale_date: initialValues.offsale_date
      ? moment(initialValues.offsale_date, "YYYY-MM-DD HH:mm")
      : undefined,
  };

  return (
    <Form layout="vertical" onFinish={onFinish} initialValues={formInitial} requiredMark={false}>
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

      <VenueSelect/>

      <Form.Item label="Poster URL" name="concert_poster_url" rules={[{ required: true }]}>
        <Input placeholder="https://example.com/poster.jpg" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large">
          Add Concert
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddConcertForm;
