import React, { useState, useEffect } from "react";
import { Modal, Typography, Divider } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ open, order }) => {
  const navigate = useNavigate();
  const [fixedTime, setFixedTime] = useState<Date | null>(null);

  useEffect(() => {
    if (open) {
      // กำหนดเวลาปัจจุบันตอนเปิด modal ครั้งเดียว
      setFixedTime(new Date());
    }
  }, [open]);

  if (!order || !fixedTime) return null;

  const formattedTime = fixedTime.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const subtotal = order.items?.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  ) || 0;

  const totalAfterDiscount = subtotal - (order.discount || 0);

  const handleClose = () => {
    // ปิด modal แล้ว navigate ไป cart ของ order.id
    navigate(`/shopping/cart/${order.id}`);
  };

  return (
    <Modal open={open} onCancel={handleClose} footer={null} width={500} centered title="การชำระเงินสำเร็จ">
      <Title level={4} style={{ textAlign: "center", color: "#52c41a" }}>
        ทำรายการชำระเงินสำเร็จ
      </Title>

      <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 16 }}>
        เวลา: {formattedTime}
      </Text>

      <Divider />

      <Title level={5}>Order ID: {order.id}</Title>

      {order.items?.map((item: any) => (
        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <Text>{item.name} x {item.quantity}</Text>
          <Text>{(item.price * item.quantity).toLocaleString()} THB</Text>
        </div>
      ))}

      <Divider />

      {order.discount > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#52c41a" }}>
          <Text>ส่วนลด/Discount</Text>
          <Text>-{order.discount.toLocaleString()} THB</Text>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 16 }}>
        <Text>ยอดสุทธิ/Total</Text>
        <Text>{totalAfterDiscount.toLocaleString()} THB</Text>
      </div>

      <Divider />

      <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: 16 }}>
        ขอบคุณที่ใช้บริการ
      </Text>
    </Modal>
  );
};

export default SuccessModal;
