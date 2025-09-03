import React from "react";
import {
  Modal,
  Typography,
  Descriptions,
  Button,
  Space,
  Divider,
  App,
  Tooltip,
} from "antd";
import {
  CopyOutlined,
  CreditCardOutlined,
  UserOutlined,
  InfoCircleOutlined,
  BankOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export type BankAccountInfo = {
  id: number;
  bank_name?: string;
  account_name?: string;
  account_number?: string; // "1234567890"
  //   branch?: string; // ไม่บังคับ
  note?: string; // ข้อความกำกับพิเศษ (เช่น โอนแล้วแนบสลิป)
  logo_url?: string; // โลโก้ธนาคาร (ถ้ามี)
  total_price?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  data?: BankAccountInfo | null;
};

const formatAccountNumber = (num?: string) =>
  (num ?? "").replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");

const CopyButton: React.FC<{ text?: string; label?: string }> = ({
  text,
  label,
}) => {
  const { message } = App.useApp();
  const disabled = !text;

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      message.success(`คัดลอก${label || ""}แล้ว`);
    } catch {
      message.error("คัดลอกไม่สำเร็จ");
    }
  };

  return (
    <Button
      size="small"
      icon={<CopyOutlined />}
      onClick={handleCopy}
      disabled={disabled}
    >
      คัดลอก
    </Button>
  );
};

const BankAccountModal: React.FC<Props> = ({ open, onClose, data }) => {
  const accountName = data?.account_name || "-";
  const accountNumber = formatAccountNumber(data?.account_number || "");
  const note = data?.note;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      styles={{
        header: { paddingBottom: 0, borderBottom: "none" },
        body: { paddingTop: 8 },
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Title level={4} style={{ margin: 0 }}>
              ชำระเงินผ่านเลขบัญชีธนาคาร
            </Title>
          </div>
        </div>
      }
    >
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(0,48,110,.06), rgba(0,48,110,.02))",
          border: "1px solid rgba(0,48,110,.08)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Descriptions
          column={1}
          size="middle"
          labelStyle={{ width: 180, color: "#5b6b7b" }}
          contentStyle={{ display: "flex", justifyItems: "space-between" }}
        >
          <Descriptions.Item
            label={
              <Space>
                <CreditCardOutlined /> เลขบัญชี
              </Space>
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Text strong style={{ letterSpacing: 1 }}>
                {accountNumber || "-"}
              </Text>
              <CopyButton label="เลขบัญชี" text={data?.account_number} />
            </div>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <BankOutlined /> ธนาคาร
              </Space>
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Text strong>{data?.bank_name}</Text>
              {/* <CopyButton label="ธนาคาร" text={data?.bank_name} /> */}
            </div>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <UserOutlined /> ชื่อบัญชี
              </Space>
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Text strong>{accountName}</Text>
              {/* <CopyButton label="ชื่อบัญชี" text={accountName} /> */}
            </div>
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <Space>
                <DollarOutlined /> ราคาที่ต้องชำระ
              </Space>
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Text strong>{data?.total_price} THB</Text>
              {/* <CopyButton label="ชื่อบัญชี" text={String(data?.total_price)} /> */}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </div>

      <Divider style={{ margin: "12px 0 16px" }} />

      <div
        style={{
          background: "#fff",
          border: "1px dashed rgba(0,0,0,.08)",
          borderRadius: 12,
          padding: 14,
        }}
      >
        <Space align="start">
          <InfoCircleOutlined style={{ color: "#faad14", fontSize: 18 }} />
          <div>
            <Text strong>วิธีการชำระเงิน</Text>
            <ul style={{ margin: "8px 0 0 16px", color: "#5b6b7b" }}>
              <li>โอนเข้าบัญชีข้างต้นตามยอดที่ระบุ</li>
              <li>คัดลอก “เลขบัญชี” และ “ชื่อบัญชี” ให้ถูกต้อง</li>
              <li>ชำระเงินแล้ว “อัปโหลดสลิป” เพื่อยืนยัน</li>
            </ul>
          </div>
        </Space>
      </div>

      {note && <AlertNote note={note} />}

      <Divider style={{ margin: "16px 0" }} />

      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button onClick={onClose}>ปิด</Button>
      </Space>
    </Modal>
  );
};

const AlertNote: React.FC<{ note: string }> = ({ note }) => (
  <div style={{ marginTop: 12 }}>
    <Tooltip title="คำแนะนำเพิ่มเติม">
      <Text type="secondary" style={{ display: "block", marginBottom: 6 }}>
        หมายเหตุ:
      </Text>
    </Tooltip>
    <div
      style={{
        background: "rgba(250, 219, 20, .08)",
        border: "1px solid rgba(255, 111, 0, 0.4)",
        color: "#df7300ff",
        padding: "10px 12px",
        borderRadius: 10,
        lineHeight: 1.6,
        textAlign: "center",
      }}
    >
      {note}
    </div>
  </div>
);

export default BankAccountModal;
