import React, { useState } from "react";
import {
  Card,
  Checkbox,
  Button,
  Typography,
  Row,
  Col,
  Space,
  message,
  Divider,
  Modal,
} from "antd";
import { BankOutlined, WalletOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./payment.css";
import QRPromptPay from "./promptpay_qr";
import { UploadModal } from "./upload";
import Loader from "../../../component/loader/loader";

const { Title, Text } = Typography;

interface PaymentOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface CartItem {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

const PaymentOrderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedItems: CartItem[] = location.state?.selectedItems || [];
  const discountRate: number = location.state?.discountRate || 0;
  const discountCode: string = location.state?.discountCode || "";

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isQRModalVisible, setQRModalVisible] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);

  const totalPrice = selectedItems.reduce(
    (total, item) => total + item.price * item.quantity * (1 - discountRate),
    0
  );

  const paymentOptions: PaymentOption[] = [
    { id: "promptpay", name: "Prompt Pay", icon: <BankOutlined style={{ fontSize: 40, color: "#1890ff" }} /> },
    { id: "truemoney", name: "True Money Wallet", icon: <WalletOutlined style={{ fontSize: 40, color: "#ff4d4f" }} /> },
  ];

  const handleConfirmPayment = async () => {
    setLoadingPayment(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      if (selectedPaymentMethod === "promptpay") setQRModalVisible(true);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleUploadReceipt = (file: File) => {
    setLoadingUpload(true);
    setTimeout(() => {
      setLoadingUpload(false);
      setTimeout(async () => {
        try {
          const formData = new FormData();
          formData.append("file", file);
          console.log("Uploading file...", file);
          message.success("อัปโหลดสลิปสำเร็จ 🎉");
          setUploadModalOpen(false);
          setShowFullScreenLoader(true);
          navigate("/e-ticket", { state: { selectedItems } });
        } catch (error) {
          console.error("Upload error:", error);
          message.error("อัปโหลดล้มเหลว กรุณาลองใหม่");
          setShowFullScreenLoader(false);
        }
      }, 1000);
    }, 1000);
  };

  const TextStyle = { fontSize: 18, color: "#00306E", fontWeight: "bold" };

  return (
    <>
      <div className="payment-container" style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        
          <Card className="payment-section">
            <Title level={4} >
                {/* <WalletOutlined /> */}
                Payment Channel
            </Title>

            <Row gutter={[24, 16]} >
              {paymentOptions.map((option) => (
                <Col xs={24} sm={12} key={option.id} >
                  <Card
                    className={`option-card ${selectedPaymentMethod === option.id ? "selected" : "unselected"}`}
                    hoverable
                    onClick={() => setSelectedPaymentMethod(option.id)}
                    style={{
                      display: "flex",                
                      alignItems: "center",           
                      textAlign: "center",
                    }}
                    >
                    <Checkbox checked={selectedPaymentMethod === option.id} />
                    <div style={{ marginTop: 8}}>{option.icon}</div>
                    <Text strong>{option.name}</Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

            <Card className="price-summary">
              <div className="summary-header">
                <Title level={4}>สรุปยอดสินค้า</Title>
              </div>
              {(selectedItems || []).map((item: CartItem) => {
                const price = item.price ?? 0;
                const quantity = item.quantity ?? 0;
                const itemTotal = price * quantity;
                const discounted = itemTotal * (1 - discountRate);
                const name = item.name ?? "N/A";
                
                
                return (
                  <div key={item.id}>
                    <div>
                      {name} x {quantity}
                    </div>
                    <div style={{ fontSize: 12, color: "gray" }}>
                      ราคาปกติ: THB {itemTotal.toLocaleString()}
                      {discountRate > 0 && (
                        <>
                          <br />
                          ราคาหลังส่วนลด: <strong>THB {discounted.toLocaleString()}</strong>
                        </>
                      )}
                    </div>
                    <Divider />
                  </div>
                );
              })}

              <Title level={5}>
                รวมทั้งหมด: <span style={{ color: "#d4380d" }}>THB {totalPrice.toLocaleString()}</span>
              </Title>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  block
                  loading={loadingPayment}
                  onClick={handleConfirmPayment}
                  disabled={!selectedPaymentMethod}
                >
                  ชำระเงิน
                </Button>

                <Button block style={{ backgroundColor: "#00b40c", color: "#fff" }} onClick={() => setUploadModalOpen(true)}>
                  อัปโหลดสลิป
                </Button>
              </Space>
            </Card>
      </div>

      <Modal open={isQRModalVisible} footer={null} centered onCancel={() => setQRModalVisible(false)} width={300}>
        <QRPromptPay phoneNumber="0902745366" amount={totalPrice} />
      </Modal>

      <UploadModal visible={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onUpload={handleUploadReceipt} loading={loadingUpload} />

      {showFullScreenLoader && <Loader />}
    </>
  );
};

export default PaymentOrderPage;