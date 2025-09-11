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
  Spin,
} from "antd";
import dayjs, { Dayjs } from "dayjs";

import { assignmentAPI } from "../../../services/https/index";
import type {
  AssignmentInterface,
  UserInterface as StaffInterface,
  ShowDateInterface,
} from "../../../interfaces";

const { Option } = Select;
const { TextArea } = Input;

type EditTaskAssignmentProps = {
  visible: boolean;
  onCancel: () => void;
  onSave?: () => void; // refresh list after save
  assignmentId: number | undefined;
};

const EditTaskAssignment: React.FC<EditTaskAssignmentProps> = ({
  visible,
  onCancel,
  onSave,
  assignmentId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDates, setShowDates] = useState<ShowDateInterface[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffInterface[]>([]);
  const [selectedConcert, setSelectedConcert] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [showDateRes, staffRes] = await Promise.all([
          assignmentAPI.getShowDates(),
          assignmentAPI.getAllStaff(),
        ]);

        const showDateData: ShowDateInterface[] = showDateRes?.data || [];
        const staffData: StaffInterface[] = staffRes?.data || [];

        // กรองเฉพาะ staff role = 4
        const filteredStaff = staffData.filter((s) => s.role_id === 4);

        setShowDates(showDateData);
        setStaffOptions(filteredStaff);

        if (assignmentId) {
          const assignmentRes = await assignmentAPI.getById(assignmentId);
          const assignment: AssignmentInterface = assignmentRes?.data;

          const show = showDateData.find(
            (s) => s.ID === assignment.show_date?.ID
          );
          if (show) setSelectedConcert(show.concert?.concert_name || null);

          const staff_ids =
            assignment.staff_assignments
              ?.map((sa: any) => sa.user?.ID)
              .filter(Boolean) || [];

          form.setFieldsValue({
            task: assignment.task,
            description: assignment.description || "",
            concert: show?.concert?.concert_name || undefined,
            show_date_id: assignment.show_date?.ID,
            staff_ids: staff_ids,
            assignment_start: assignment.assignment_start
              ? dayjs(assignment.assignment_start)
              : undefined,
            assignment_end: assignment.assignment_end
              ? dayjs(assignment.assignment_end)
              : undefined,
          });
        }
      } catch (err) {
        console.error(err);
        message.error("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    fetchData();
  }, [visible, assignmentId, form]);

  const handleSubmit = async (values: any) => {
    const start: Dayjs = values.assignment_start;
    const end: Dayjs = values.assignment_end;

    if (!start || !end) {
      message.error("กรุณาเลือกวันเวลาเริ่มและสิ้นสุดงาน");
      return;
    }

    if (start.isAfter(end)) {
      message.error("วันเวลาเริ่มงานต้องไม่มากกว่าวันเวลาสิ้นสุดงาน");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        task: values.task,
        description: values.description,
        show_date_id: Number(values.show_date_id),
        assignment_start: start.format("YYYY-MM-DD HH:mm:ss"),
        assignment_end: end.format("YYYY-MM-DD HH:mm:ss"),
        staff_ids: values.staff_ids,
      };

      if (assignmentId) {
        await assignmentAPI.update(assignmentId, payload);
        message.success("แก้ไข Assignment เรียบร้อยแล้ว");
        onSave?.();
        onCancel();
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.error || "❌ บันทึกข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const filteredShowDates = selectedConcert
    ? showDates.filter((s) => s.concert?.concert_name === selectedConcert)
    : [];

  return (
    <Modal
      title="แก้ไข Assignment"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Save Changes"
      cancelText="Cancel"
      width={800}
      confirmLoading={saving}
    >
      {loading ? (
        <Spin tip="Loading..." style={{ marginTop: 50 }} />
      ) : (
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
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
                  showSearch
                  optionFilterProp="children"
                  onChange={(val) => {
                    setSelectedConcert(val);
                    form.setFieldsValue({ show_date_id: undefined }); // เคลียร์ show date เมื่อเปลี่ยน concert
                  }}
                  filterOption={(input, option) => {
                    const text = option?.children as unknown as string;
                    return text.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {[...new Set(showDates.map((sd) => sd.concert?.concert_name))] // เอาชื่อคอนเสิร์ตไม่ซ้ำ
                    .filter(Boolean) // กรอง undefined/null
                    .map((concertName) => (
                      <Select.Option key={concertName} value={concertName}>
                        {concertName}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Show Date & Venue"
                name="show_date_id"
                rules={[
                  { required: true, message: "กรุณาเลือกวันที่/สถานที่" },
                ]}
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
                  { required: true, message: "เลือกทีมงานอย่างน้อย 1 คน" },
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
                    const label = `${s.first_name || ""} ${s.last_name || ""}${
                      s.department
                        ? ` (${s.department.department} - ${s.position?.position})`
                        : ""
                    }`;
                    return (
                      <Option key={s.ID} value={s.ID} label={label}>
                        {label}
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
                rules={[
                  { required: true, message: "กรุณาเลือกวันเวลาเริ่มงาน" },
                ]}
              >
                <DatePicker
                  showTime={{ format: "HH:mm:ss" }}
                  format="DD/MM/YYYY HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="End Date & Time"
                name="assignment_end"
                rules={[
                  { required: true, message: "กรุณาเลือกวันเวลาสิ้นสุดงาน" },
                ]}
              >
                <DatePicker
                  showTime={{ format: "HH:mm:ss" }}
                  format="DD/MM/YYYY HH:mm:ss"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
              >
                <TextArea rows={3} placeholder="รายละเอียดงาน" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default EditTaskAssignment;
