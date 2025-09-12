/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { assignmentAPI } from "../../../services/https/index";
import type { ShowDatesInterface } from "../../../interface/showdate";
import type { UserInterface } from "../../../interface/user";
import type { AssignmentInterface } from "../../../interface/assignment";


const { Option } = Select;
const { TextArea } = Input;

type TaskAssignmentFormProps = {
  visible: boolean;
  onCancel: () => void;
  onSave?: () => void;
};

const AddTaskAssignment: React.FC<TaskAssignmentFormProps> = ({
  visible,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [showDates, setShowDates] = useState<ShowDatesInterface[]>([]);
  const [staffOptions, setStaffOptions] = useState<UserInterface[]>([]);
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

        // filter staff role_id === 4
        const staffOnly = (staffRes?.data || []).filter(
          (s: UserInterface) => s.role_id === 4
        );
        setStaffOptions(staffOnly);
      } catch (err) {
        console.error(err);
        message.error("Failed to load show dates or staff");
      }
    };

    fetchData();
  }, [visible]);

  const validateDateTime = (start: Dayjs, end: Dayjs) => {
    const now = dayjs();
    if (start.isBefore(now) || end.isBefore(now)) {
      return "วันและเวลาต้องอยู่ในอนาคต";
    }
    if (start.isAfter(end)) {
      return "วันเริ่มต้องน้อยกว่าวันสิ้นสุด";
    }
    return null;
  };

  const handleValuesChange = (_: any, allValues: any) => {
    if (allValues.assignment_start && allValues.assignment_end) {
      const error = validateDateTime(
        allValues.assignment_start,
        allValues.assignment_end
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
        assignment_start: values.assignment_start.format("YYYY-MM-DD HH:mm:ss"),
        assignment_end: values.assignment_end.format("YYYY-MM-DD HH:mm:ss"),
        staff_ids: values.staff_ids,
      };

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
          assignment_start: dayjs().hour(9).minute(0).second(0),
          assignment_end: dayjs().hour(18).minute(0).second(0),
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
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as unknown as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {concertOptions.map((c, idx) => (
                  <Select.Option key={idx} value={c}>
                    {c}
                  </Select.Option>
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
                      {s.first_name} {s.last_name} ( {s.department?.department} -{" "}
                      {s.position?.position} )
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Start Date & Time"
              name="assignment_start"
              rules={[{ required: true, message: "กรุณาเลือกวันและเวลาเริ่ม" }]}
            >
              <DatePicker
                showTime={{ format: "HH:mm:ss" }}
                format="DD/MM/YYYY HH:mm:ss"
                style={{ width: 300 }}
                disabledDate={(current) => current && current < dayjs().startOf("day")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="End Date & Time"
              name="assignment_end"
              rules={[{ required: true, message: "กรุณาเลือกวันและเวลาสิ้นสุด" }]}
            >
              <DatePicker
                showTime={{ format: "HH:mm:ss" }}
                format="DD/MM/YYYY HH:mm:ss"
                style={{ width: 300 }}
                disabledDate={(current) => current && current < dayjs().startOf("day")}
              />
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
