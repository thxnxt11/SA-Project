// QRPromptPay.tsx
import React, { useEffect, useState } from "react";
import promptpay from "promptpay-qr";
import QRCode from "qrcode";

interface QRPromptPayProps {
  phoneNumber: string;
  amount: number;
}

const QRPromptPay: React.FC<QRPromptPayProps> = ({ phoneNumber, amount }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const payload = promptpay(phoneNumber, { amount });
        const url = await QRCode.toDataURL(payload);
        setQrCodeUrl(url);
      } catch (err) {
        console.error("QR Code Generation Error:", err);
      }
    };

    generateQRCode();
  }, [phoneNumber, amount]);

  if (!qrCodeUrl) return <p>กำลังสร้าง QR Code...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: 20, fontSize: "18px" }}>
      <h3>PromptPay QR</h3>
      <img src={qrCodeUrl} alt="PromptPay QR Code" width={200} />
      <p>ยอดชำระ: {amount.toLocaleString()} บาท</p>
    </div>
  );
};

export default QRPromptPay;