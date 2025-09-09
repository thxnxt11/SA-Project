/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Row,
  Col,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { assignmentAPI } from "../../../services/https/index";
import type {
  UserInterface as StaffInterface,
  ShowDateInterface,
  AssignmentInterface,
} from "../../../interfaces";

const { Option } = Select;
const { TextArea } = Input;

type TaskAssignmentFormProps = {
  visible: boolean;
  onCancel: () => void;
  onSave?: () => void; // reload ตารางหลังเพิ่มงาน
};

const AddTaskAssignment: React.FC<TaskAssignmentFormProps> = ({
  visible,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [showDates, setShowDates] = useState<ShowDateInterface[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffInterface[]>([]);
  const [selectedConcert, setSelectedConcert] = useState<string | null>(null);
  const [dateTimeError, setDateTimeError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    const fetchData = async () => {
      try {
        const [showDateRes, staffRes] = await Promise.all([
          assignmentAPI.getShowDates(),
          assignmentAPI.getAllStaff(),
        ]);
        setShowDates(showDateRes?.data || []);
        setStaffOptions(staffRes?.data || []);
      } catch (err) {
        console.error(err);
        message.error("Failed to load show dates or staff");
      }
    };

    fetchData();
  }, [visible]);

  const validateDateTime = (
    startDate: Dayjs,
    endDate: Dayjs,
    startTime: Dayjs,
    endTime: Dayjs
  ) => {
    if (startDate.isAfter(endDate, "day"))
      return "Start date must be before or equal to End date";
    if (
      startDate.isSame(endDate, "day") &&
      startTime.isAfter(endTime, "minute")
    ) {
      return "Start time must be before or equal to End time on the same day";
    }
    return null;
  };

  const handleValuesChange = (_: any, allValues: any) => {
    if (
      allValues.startDate &&
      allValues.endDate &&
      allValues.startTime &&
      allValues.endTime
    ) {
      const error = validateDateTime(
        allValues.startDate,
        allValues.endDate,
        allValues.startTime,
        allValues.endTime
      );
      setDateTimeError(error);
    } else {
      setDateTimeError(null);
    }
  };

  const handleConcertChange = (concertName: string) => {
    setSelectedConcert(concertName);
    form.setFieldsValue({ show_date_id: undefined });
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload: AssignmentInterface = {
        task: values.task,
        description: values.description,
        show_date_id: values.show_date_id,
        assignment_date_start: (values.startDate as Dayjs).format("YYYY-MM-DD"),
        assignment_date_end: (values.endDate as Dayjs).format("YYYY-MM-DD"),
        assignment_time_start: (values.startTime as Dayjs).format("HH:mm"),
        assignment_time_end: (values.endTime as Dayjs).format("HH:mm"),
        staff_ids: values.staff_ids, // ส่ง staff_ids ให้ backend
      };

      console.log("Payload to backend:", payload);

      await assignmentAPI.create(payload);
      message.success("Task assigned successfully!");
      form.resetFields();
      setSelectedConcert(null);
      onCancel();
      if (onSave) onSave();
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.error || "Failed to assign task.");
    }
  };

  const concertOptions = Array.from(
    new Set(showDates.map((s) => s.concert?.concert_name))
  );
  const filteredShowDates = selectedConcert
    ? showDates.filter((s) => s.concert?.concert_name === selectedConcert)
    : [];

  return (
    <Modal
      title="Assign New Task"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Assign Task"
      cancelText="Cancel"
      width={800}
      okButtonProps={{ disabled: !!dateTimeError }}
    >
      {dateTimeError && (
        <p style={{ color: "red", marginBottom: 16 }}>{dateTimeError}</p>
      )}
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        initialValues={{
          startDate: dayjs(),
          startTime: dayjs("09:00", "HH:mm"),
          endDate: dayjs(),
          endTime: dayjs("18:00", "HH:mm"),
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Task Title"
              name="task"
              rules={[{ required: true, message: "กรุณากรอกชื่องาน" }]}
            >
              <Input placeholder="ชื่องาน" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Concert"
              name="concert"
              rules={[{ required: true, message: "กรุณาเลือกคอนเสิร์ต" }]}
            >
              <Select
                placeholder="เลือกคอนเสิร์ต"
                onChange={handleConcertChange}
                allowClear
              >
                {concertOptions.map((c, idx) => (
                  <Option key={idx} value={c}>
                    {c}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Show Date & Venue"
              name="show_date_id"
              rules={[{ required: true, message: "กรุณาเลือกวันที่/สถานที่" }]}
            >
              <Select
                placeholder={
                  selectedConcert
                    ? "เลือกวันที่/สถานที่"
                    : "กรุณาเลือก Concert ก่อน"
                }
                disabled={!selectedConcert}
              >
                {filteredShowDates.map((s) => (
                  <Option key={s.ID} value={s.ID}>
                    {s.show_date
                      ? `${dayjs(s.show_date).format("DD/MM/YYYY HH:mm")} - ${
                          s.venue?.venue_name
                        }`
                      : s.venue?.venue_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Assigned Staff"
              name="staff_ids"
              rules={[
                { required: true, message: "กรุณาเลือกทีมงานอย่างน้อย 1 คน" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="เลือกทีมงาน"
                optionLabelProp="label"
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {staffOptions.map((s) => {
                  const label = `${s.first_name} ${s.last_name}${
                    s.department
                      ? ` ( ${s.department?.department} - ${s.position?.position} )`
                      : ""
                  }`;
                  return (
                    <Option key={s.ID} value={s.ID} label={label}>
                      {s.first_name} {s.last_name} ( {s.department?.department}{" "}
                      - {s.position?.position})
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Start Date" name="startDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Start Time" name="startTime">
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="End Date" name="endDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="End Time" name="endTime">
              <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "กรุณากรอกรายละเอียดงาน" }]}
            >
              <TextArea rows={3} placeholder="รายละเอียดงาน" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddTaskAssignment;
