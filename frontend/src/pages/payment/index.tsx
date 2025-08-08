import React, { useState, useEffect } from "react";
import Navbar from "../../component/layout/navbar";
import {
  Card,
  Checkbox,
  Button,
  Typography,
  Row,
  Col,
  Space,
  message,
} from "antd";
import {
  CreditCardOutlined,
  WalletOutlined,
  BankOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { LuShieldCheck, LuShieldX } from "react-icons/lu";
import { useLocation, useNavigate } from "react-router-dom";
import "./payment.css";
import QRPromptPay from "./promptpay_qr";
import { Modal } from "antd";
import { UploadModal } from "./upload";
import Loader from "../../component/loader/loader";

const { Title, Text } = Typography;

interface PaymentOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface TicketOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state || {};

  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [timeLeft, setTimeLeft] = useState<number>(600);

  const basePrice = booking.unitPrice;
  const discount = booking.discount ?? 0;
  const seatNo = booking.seatNo;
  const quantity = booking.quantity ?? 1;
  const showDate = booking.showDate ?? "";
  const showTime = booking.showTime ?? "";
  const zone = booking.zone ?? "";
  const refundInsuranceFee = 291;

  const totalPrice =
    basePrice * quantity +
    discount +
    (selectedTicketType === "refundable" ? refundInsuranceFee : 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      navigate("/selectzone");
    }
  }, [timeLeft, navigate]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const ticketOptions: TicketOption[] = [
    {
      id: "refundable",
      name: "Refundable Ticket",
      icon: <LuShieldCheck style={{ fontSize: "40px" }} />,
    },
    {
      id: "non-refundable",
      name: "Non Refundable Ticket",
      icon: <LuShieldX style={{ fontSize: "40px" }} />,
    },
  ];

  const paymentOptions: PaymentOption[] = [
    {
      id: "promptpay",
      name: "Prompt Pay",
      icon: <BankOutlined style={{ fontSize: "40px", color: "#1890ff" }} />,
    },
    {
      id: "truemoney",
      name: "True Money Wallet",
      icon: <WalletOutlined style={{ fontSize: "40px", color: "#ff4d4f" }} />,
    },
  ];
  const [isQRModalVisible, setQRModalVisible] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const handleOpenUploadModal = () => setUploadModalOpen(true);
  const handleCloseUploadModal = () => setUploadModalOpen(false);
  const handleConfirmPayment = async () => {
    setLoadingPayment(true);
    try {
      // mock: บันทึกข้อมูลการชำระเงิน
      await new Promise((res) => setTimeout(res, 1500)); // จำลอง delay
      if (selectedPaymentMethod === "promptpay") {
        setQRModalVisible(true);
      }
    } finally {
      setLoadingPayment(false);
    }
  };
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);
  const handleUploadReceipt = (file: File) => {
    setLoadingUpload(true);
    setTimeout(() => {
      setLoadingUpload(false);
      setTimeout(async () => {
        try {
          const formData = new FormData();
          formData.append("file", file);

          // ตัวอย่าง: await axios.post("/api/upload-receipt", formData);
          console.log("Uploading file...", file);
          message.success("อัปโหลดสลิปสำเร็จ 🎉");

          setUploadModalOpen(false);
          setShowFullScreenLoader(true);
          navigate("/e-ticket", {
            state: {
              showDate: showDate,
              showTime: showTime,
              zone: zone,
              seatNo: seatNo,
              quantity: quantity,
            },
          });
        } catch (error) {
          setShowFullScreenLoader(true);
          console.error("Upload error:", error);
          message.error("อัปโหลดล้มเหลว กรุณาลองใหม่");
          setShowFullScreenLoader(false);
        }
      }, 1500);
    }, 1500);
  };

  const TextStyle = {
    fontSize: "18px",
    color: "#00306E",
    fontWeight: "bold",
  };

  return (
    <>
      <Navbar />
      <div className="payment-container">
        <Row
          gutter={24}
          style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}
        >
          <Col xs={24} lg={16}>
            <div className="timer-badge">
              <ClockCircleOutlined />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <Card className="payment-section" style={{ marginBottom: "24px" }}>
              <Title
                level={4}
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LuShieldCheck style={{ marginRight: "8px" }} /> Refundable
                Ticket
              </Title>
              <Row gutter={16}>
                {ticketOptions.map((option) => (
                  <Col xs={24} sm={12} key={option.id}>
                    <Card
                      className={`option-card ${
                        selectedTicketType === option.id
                          ? "selected"
                          : "unselected"
                      }`}
                      onClick={() => setSelectedTicketType(option.id)}
                      hoverable
                    >
                      <div className="option-content">
                        <Checkbox
                          checked={selectedTicketType === option.id}
                          className="option-checkbox"
                        />
                        <div className="option-info">
                          {option.icon}
                          <Text
                            strong
                            style={{ marginTop: "8px", display: "block" }}
                          >
                            {option.name}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            <Card className="payment-section">
              <Title
                level={4}
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CreditCardOutlined style={{ marginRight: "8px" }} /> Payment
                Channel
              </Title>
              <Row gutter={[16, 24]}>
                {paymentOptions.map((option) => (
                  <Col xs={24} sm={12} key={option.id}>
                    <Card
                      className={`option-card ${
                        selectedPaymentMethod === option.id
                          ? "selected"
                          : "unselected"
                      }`}
                      onClick={() => setSelectedPaymentMethod(option.id)}
                      hoverable
                    >
                      <div className="option-content">
                        <Checkbox
                          checked={selectedPaymentMethod === option.id}
                          className="option-checkbox"
                        />
                        <div className="option-info">
                          {option.icon}
                          <Text
                            strong
                            style={{ marginTop: "8px", display: "block" }}
                          >
                            {option.name}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="price-summary">
              <div className="summary-header">
                <Text strong style={{ fontSize: "18px" }}>
                  รายการ/List
                </Text>
                <Text strong style={{ fontSize: "18px" }}>
                  ราคา/Price
                </Text>
              </div>
              <div className="summary-item">
                <Text style={TextStyle}>
                  {quantity} x {zone}
                </Text>
                <Text style={TextStyle}>{basePrice.toLocaleString()} THB</Text>
              </div>
              {discount !== 0 && (
                <div className="summary-item discount">
                  <Text style={{ color: "#52c41a", fontSize: "17px" }}>
                    ส่วนลด/Discount
                  </Text>
                  <Text style={{ color: "#52c41a", fontSize: "17px" }}>
                    {discount} THB
                  </Text>
                </div>
              )}
              {selectedTicketType === "refundable" && (
                <div className="summary-item">
                  <Text style={{ fontSize: "17px" }}>
                    การประกันบัตร (Refund)
                  </Text>
                  <Text style={{ fontSize: "17px" }}>
                    {refundInsuranceFee.toLocaleString()} THB
                  </Text>
                </div>
              )}
              <div className="summary-divider" />
              <div className="summary-total">
                <Text strong style={TextStyle}>
                  ราคา/Total Price
                </Text>
                <Text strong style={TextStyle}>
                  {totalPrice.toLocaleString()} THB
                </Text>
              </div>
              <Row style={{ display: "flex", justifyContent: "center" }}>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    block
                    className="payment-button"
                    style={{ marginTop: "16px" }}
                    loading={loadingPayment}
                    onClick={handleConfirmPayment}
                  >
                    Payment
                  </Button>
                  <Button
                    type="primary"
                    className="payment-button"
                    onClick={handleOpenUploadModal}
                    style={{ marginTop: "16px", backgroundColor: "#00b40cff" }}
                  >
                    Upload Receipt
                  </Button>
                </Space>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
      <Modal
        open={isQRModalVisible}
        onCancel={() => setQRModalVisible(false)}
        footer={null}
        centered
        width={300}
      >
        <QRPromptPay phoneNumber="0902745366" amount={totalPrice} />
        <p
          style={{
            textAlign: "center",
            marginTop: 16,
            color: "#ff0000",
            fontSize: "18px",
          }}
        >
          โปรดชำระเงินภายใน {formatTime(timeLeft)} นาที
        </p>
      </Modal>
      <UploadModal
        visible={uploadModalOpen}
        onClose={handleCloseUploadModal}
        onUpload={handleUploadReceipt}
        loading={loadingUpload}
      />
      {showFullScreenLoader && <Loader />}
    </>
  );
};

export default Payment;
