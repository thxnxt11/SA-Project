import React, { useMemo, useState } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Button,
  Alert,
  Typography,
  Space,
  Tag,
  message,
} from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import { seatAPI } from "../../../services/https";
// ปรับ path ให้ตรงโปรเจกต์คุณ

const { Text } = Typography;

export interface AddSeatModalProps {
  open: boolean;
  venueId?: number; // venue_id ที่คลิกมาจากการ์ด
  onClose: () => void; // ปิด modal
  onSuccess?: () => void; // callback หลังสร้างสำเร็จ (เช่น refresh list)
}

type CreatePayload = {
  total_seat: number;
};

const AddSeatModal: React.FC<AddSeatModalProps> = ({
  open,
  venueId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<CreatePayload>();
  const [submitting, setSubmitting] = useState(false);

  const totalSeat: number = Form.useWatch("total_seat", form) ?? 0;

  // ตรวจว่าหาร 15 ลงตัวไหม
  const divisible = useMemo(
    () => totalSeat > 0 && totalSeat % 15 === 0,
    [totalSeat]
  );

  // จำนวนแถว = total_seat / 15
  const rows = useMemo(
    () => (divisible ? totalSeat / 15 : 0),
    [divisible, totalSeat]
  );

  const handleCreate = async () => {
    try {
      if (!venueId) {
        message.error("ไม่พบ venue_id");
        return;
      }
      const values = await form.validateFields(); // { total_seat }
      const payload = {
        venue_id: Number(venueId),
        total_seat: Number(values.total_seat),
      };

      await seatAPI.creatSeat(payload);

      message.success(
        `สร้างที่นั่งสำเร็จ ${payload.total_seat} ที่นั่ง (${
          payload.total_seat / 15
        } แถว × 15 ที่)`
      );
      onClose?.();
      onSuccess?.();
      form.resetFields();
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "ไม่สามารถสร้างที่นั่งได้";
      message.error(backendMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      title={
        <Space>
          <Text strong>Generate Seats</Text>
          <Tag color="blue">venue_id: {venueId ?? "-"}</Tag>
        </Space>
      }
      footer={
        <Space>
          <Button onClick={onClose}>ยกเลิก</Button>
          <Button
            type="primary"
            onClick={handleCreate}
            loading={submitting}
            disabled={!divisible || !venueId}
          >
            Create
          </Button>
        </Space>
      }
      centered
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Alert
          type="info"
          showIcon
          message={
            <Space direction="vertical" size={2}>
              <Text>
                ระบบจะสร้างที่นั่งเป็นแถวละ <b>15</b> ที่ (A1–A15, B1–B15, …)
              </Text>
              <Text type="secondary">
                เงื่อนไข: จำนวนรวมต้องหาร <b>15</b> ลงตัว (เช่น 15, 30, 45, …)
              </Text>
            </Space>
          }
        />

        <Form form={form} layout="vertical" initialValues={{ total_seat: 15 }}>
          <Form.Item
            label="จำนวนที่นั่งทั้งหมดต่อ 1 โซน "
            name="total_seat"
            rules={[
              { required: true, message: "กรุณาระบุจำนวนที่นั่ง" },
              {
                type: "number",
                min: 15,
                message: "อย่างน้อย 15 ที่นั่ง",
              },
              {
                validator: (_, value) => {
                  if (typeof value !== "number" || value <= 0) {
                    return Promise.reject("กรุณากรอกจำนวนที่นั่งให้ถูกต้อง");
                  }
                  if (value % 15 !== 0) {
                    return Promise.reject("จำนวนที่นั่งต้องหาร 15 ลงตัว");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              placeholder="เช่น 150"
              style={{ width: "100%" }}
              min={15}
              step={15}
              controls
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Space>
              {divisible ? (
                <Space>
                  <CheckCircleTwoTone twoToneColor="#52c41a" />
                  <Text>หาร 15 ลงตัว</Text>
                </Space>
              ) : (
                <Space>
                  <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                  <Text type="warning">ต้องหาร 15 ลงตัว</Text>
                </Space>
              )}
            </Space>

            <Space>
              <Text type="secondary">จำนวนแถว:</Text>
              <Tag color={divisible ? "green" : "default"}>{rows}</Tag>
            </Space>
          </div>
        </Form>
      </Space>
    </Modal>
  );
};

export default React.memo(AddSeatModal);
