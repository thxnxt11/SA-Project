// src/pages/concert/edit/consert.tsx
import React from "react";
import { Form, Input, DatePicker, Button, Card } from "antd";

import type { ConcertInterface } from "../../../../interface/concert";
import VenueSelect from "../venue";
import dayjs from "dayjs"; // use this to show day instead of memont in antd v.5


interface EditConcertFormProps {
  initialValues: ConcertInterface;
  onFinish: (values: any) => void;
}

const EditConcertForm: React.FC<EditConcertFormProps> = ({ initialValues, onFinish }) => {
  const formInitial = {
    ...initialValues,

    venue_id:
    (initialValues as any)?.venue_id ??
    (initialValues as any)?.venue?.id ??
    undefined,

    onsale_date: initialValues.onsale_date ? dayjs(initialValues.onsale_date,)  : undefined,
    offsale_date: initialValues.offsale_date ? dayjs(initialValues.offsale_date) : undefined,

    date1: initialValues?.ShowDates?.[0]?.show_date ? dayjs(initialValues.ShowDates[0].show_date) : undefined,
    date2: initialValues?.ShowDates?.[1]?.show_date ? dayjs(initialValues.ShowDates[1].show_date) : undefined,
    date3: initialValues?.ShowDates?.[2]?.show_date ? dayjs(initialValues.ShowDates[2].show_date) : undefined,
    date4: initialValues?.ShowDates?.[3]?.show_date ? dayjs(initialValues.ShowDates[3].show_date) : undefined,
    date5: initialValues?.ShowDates?.[4]?.show_date ? dayjs(initialValues.ShowDates[4].show_date) : undefined,
    date6: initialValues?.ShowDates?.[5]?.show_date ? dayjs(initialValues.ShowDates[5].show_date) : undefined,
    date7: initialValues?.ShowDates?.[6]?.show_date ? dayjs(initialValues.ShowDates[6].show_date) : undefined,

    
  
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
        <DatePicker   showTime={{ format:"HH:mm" }} style={{ width: "100%" }}  />
      </Form.Item>

      <Form.Item label="Off sale" name="offsale_date" rules={[{ required: true }]}>
        <DatePicker showTime={{ format:"HH:mm" }} style={{ width: "100%" }}  />
      </Form.Item>

      
        <VenueSelect/>
    

      <Form.Item label="Poster URL" name="concert_poster_url" rules={[{ required: true }]}>
        <Input placeholder="https://example.com/poster.jpg" />
      </Form.Item>

        <Card size="small" style={{ marginTop: 8, marginBottom: 16 }} title="Show time">
      {[
        { label: "showdate (required)", name: "date1", required: true, msg: "must be at least 1 showdate" },
        { label: "showdate (optional)", name: "date2" },
        { label: "showdate (optional)", name: "date3" },
        { label: "showdate (optional)", name: "date4" },
        { label: "showdate (optional)", name: "date5" },
        { label: "showdate (optional)", name: "date6" },
        { label: "showdate (optional)", name: "date7" },
      ].map((f) => (
        <Form.Item
          key={f.name}
          label={f.label}
          name={f.name}
          rules={f.required ? [{ required: true, message: f.msg || "required" }] : []}
        >
          <DatePicker
            showTime={{ format: "HH:mm" }}
            style={{ width: "100%" }}
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>
      ))}
      </Card>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large">
          Update Concert
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditConcertForm;
