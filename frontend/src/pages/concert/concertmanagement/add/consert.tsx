// src/pages/concert/edit/consert.tsx
import React from "react";
import { Form, Input, DatePicker, Button, Space, Card } from "antd";
import type { ConcertInterface } from "../../../../interface/concert";
import VenueSelect from "../venue";
import dayjs from "dayjs";

interface AddConcertFormProps {
  initialValues?: Partial<ConcertInterface>;
  onFinish: (values: any) => void;
}

const AddConcertForm: React.FC<AddConcertFormProps> = ({ initialValues, onFinish }) => {
  const [form] = Form.useForm();

  // Wrap parent onFinish to normalize show_dates to ISO strings
  const handleSubmit = (values: any) => {
    const normalized = {
      ...values,
      // keep your existing behavior for onsale/offsale
      onsale_date: values.onsale_date ? dayjs(values.onsale_date).toISOString() : null,
      offsale_date: values.offsale_date ? dayjs(values.offsale_date).toISOString() : null,
      // turn [{ venue_id, start_time, end_time }, ...] into ISO string payload
      show_dates: Array.isArray(values.show_dates)
        ? values.show_dates
            .filter((d: any) => d && d.venue_id && d.start_time)
            .map((d: any) => ({
              venue_id: Number(d.venue_id),
              start_time: dayjs(d.start_time).toISOString(),
              end_time: d.end_time ? dayjs(d.end_time).toISOString() : null,
            }))
        : [],
    };

    onFinish(normalized);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleSubmit}
      requiredMark={false}
      initialValues={{
        ...initialValues,
        // AntD v5 uses dayjs values for DatePicker
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

      <VenueSelect />

      <Form.Item label="Poster URL" name="concert_poster_url" rules={[{ required: true }]}>
        <Input placeholder="https://example.com/poster.jpg" />
      </Form.Item>

      {/* ---- Show Dates section ---- */}
      <Card size="small" style={{ marginTop: 8, marginBottom: 16 }} title="Show dates">
        <Form.List name="show_dates" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, idx) => (
                <Card key={field.key} size="small" style={{ marginBottom: 12 }} title={`Show #${idx + 1}`}
                  extra={
                    fields.length > 1 ? (
                      <Button danger type="link" onClick={() => remove(field.name)}>
                        Remove
                      </Button>
                    ) : null
                  }
                >
                  {/* venue for this show (optional: if each show can have different venue) */}
                  <Form.Item
                    label="Venue (for this show)"
                    name={[field.name, "venue_id"]}
                    rules={[{ required: true, message: "Please select a venue" }]}
                  >
                    <VenueSelect name={undefined} label={undefined} required />
                  </Form.Item>

                  <Space direction="horizontal" size="large" style={{ width: "100%" }}>
                    <Form.Item
                      label="Start time"
                      name={[field.name, "start_time"]}
                      rules={[{ required: true, message: "Please select start time" }]}
                      style={{ flex: 1 }}
                    >
                      <DatePicker
                        showTime={{ format: "HH:mm" }}
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD HH:mm"
                      />
                    </Form.Item>

                    <Form.Item
                      label="End time"
                      name={[field.name, "end_time"]}
                      style={{ flex: 1 }}
                    >
                      <DatePicker
                        showTime={{ format: "HH:mm" }}
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD HH:mm"
                      />
                    </Form.Item>
                  </Space>
                </Card>
              ))}

              <Button type="dashed" block onClick={() => add({})}>
                + Add another show
              </Button>
            </>
          )}
        </Form.List>
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
