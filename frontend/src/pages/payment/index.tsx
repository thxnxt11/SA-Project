import React, { useState, useEffect, useMemo } from "react";
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
  Alert,
  Modal,
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
import { UploadModal } from "./upload";
import Loader from "../../component/loader/loader";
import { paymentAPI } from "../../services/https";

const { Title, Text } = Typography;

interface RefundType {
  id: number;
  refund_type: string; // เช่น "Refundable Ticket" / "Non Refundable Ticket"
  refund_fee: number; // ค่าธรรมเนียมเพิ่ม
}

interface PaymentOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface PaymentMethod {
  id: number;
  payment_method: string; // เช่น "PromptPay", "Bank Transfer", "TrueMoney"
  account_name?: string;
  account_number?: string;
  bank_name?: string;
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    showDate,
    showTime,
    zone,
    seatNo,
    quantity,
    unitPrice,
    discount,
    bookingId,
  } = (location.state as any) || {};

  useEffect(() => {
    console.log("Received state from bookingdetails:", location.state);
  }, []);

  useEffect(() => {
    if (!location.state) {
      navigate("/concerts", { replace: true });
    }
  }, [location.state, navigate]);

  // ========= Refund Types from backend =========
  const [refundTypes, setRefundTypes] = useState<RefundType[]>([]);
  const [selectedRefundTypeId, setSelectedRefundTypeId] = useState<
    number | null
  >(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    number | null
  >(null);

  const onGetInitialData = async () => {
    try {
      const [RefundtypesRes, PaymentMethodRes] = await Promise.all([
        paymentAPI.getAllRefundTypes(),
        paymentAPI.getAllPaymentMethods(),
      ]);
      if (RefundtypesRes?.status === 200 && PaymentMethodRes?.status === 200) {
        setRefundTypes(RefundtypesRes.data);
        setPaymentMethods(PaymentMethodRes.data);
        // console.log("Refund types:", RefundtypesRes.data);
        // if (RefundtypesRes.data.length > 0)
        //   setSelectedRefundTypeId(RefundtypesRes.data[0].id); // default: อันแรก
      } else {
        message.open({
          type: "error",
          content: "ไม่สามารถดึงข้อมูลเริ่มต้นได้",
        });
      }
    } catch (e) {
      console.error(e);
      message.error("เกิดข้อผิดพลาดในการดึงข้อมูลเริ่มต้น");
    }
  };
  const selectedRefundType = useMemo(
    () => refundTypes.find((r) => r.id === selectedRefundTypeId) || null,
    [refundTypes, selectedRefundTypeId]
  );
  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethods.find((pm) => pm.id === selectedPaymentMethodId) || null,
    [paymentMethods, selectedPaymentMethodId]
  );
  useEffect(() => {
    onGetInitialData();
    return () => {};
  }, []);

  // ========= UI State อื่น ๆ =========
  const [isQRModalVisible, setQRModalVisible] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);

  // ========= ราคา =========
  const basePrice = unitPrice ?? 0;
  const qty = quantity ?? 1;
  const discountValue = discount ?? 0;
  const extraRefundFee = selectedRefundType?.refund_fee ?? 0;

  const totalPrice = useMemo(() => {
    return basePrice * qty - discountValue + extraRefundFee;
  }, [basePrice, qty, discountValue, extraRefundFee]);

  // ========= Payment channel (เดิม) =========
  // const paymentOptions: PaymentMethod[] = [
  //   {
  //     id: "promptpay",
  //     name: "Prompt Pay",
  //     icon: <BankOutlined style={{ fontSize: 40, color: "#1890ff" }} />,
  //   },
  //   {
  //     id: "truemoney",
  //     name: "True Money Wallet",
  //     icon: <WalletOutlined style={{ fontSize: 40, color: "#ff4d4f" }} />,
  //   },
  // ];

  // ========= Timer =========
  const PAY_TIMELEFT = 600; // 10 นาที
  const countdownKey = `booking_start_time_${bookingId ?? "temp"}`;
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(PAY_TIMELEFT);

  useEffect(() => {
    const storedStartTime = localStorage.getItem(countdownKey);
    let startTime: number;

    if (storedStartTime) {
      startTime = parseInt(storedStartTime, 10);
    } else {
      startTime = Date.now();
      localStorage.setItem(countdownKey, startTime.toString());
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const timeLeft = PAY_TIMELEFT - elapsed;

      if (timeLeft <= 0) {
        clearInterval(timer);
        localStorage.removeItem(countdownKey);
        setPaymentTimeLeft(0);
        message.error("หมดเวลาการชำระเงิน");
        navigate("/concerts", { replace: true });
      } else {
        setPaymentTimeLeft(timeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownKey, navigate]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // ========= Handlers =========
  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod) {
      message.warning("กรุณาเลือกช่องทางการชำระเงิน");
      return;
    }
    setLoadingPayment(true);
    try {
      const payload = {
        booking_id: bookingId,
        payment_method: selectedPaymentMethod?.payment_method,
        amount: totalPrice,
        refund_type_id: selectedRefundTypeId, // ส่งประเภทตั๋วที่เลือกไปด้วย
      };
      const res = await paymentAPI.create(payload);

      // ตัวอย่าง: ถ้าเป็น promptpay แสดง QR
      if (selectedPaymentMethod?.payment_method === "promptpay") {
        setQRModalVisible(true);
      } else if (selectedPaymentMethod?.payment_method === "truemoney") {
        message.success("กำลังนำไปสู่ขั้นตอนชำระเงินผ่าน TrueMoney");
      }
    } catch (e) {
      console.error(e);
      message.error("ไม่สามารถเริ่มการชำระเงินได้");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleOpenUploadModal = () => setUploadModalOpen(true);
  const handleCloseUploadModal = () => setUploadModalOpen(false);

  const handleUploadReceipt = async (file: File) => {
    setLoadingUpload(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("booking_id", String(bookingId ?? ""));

      // await axios.post("/api/payments/upload-receipt", formData)
      await new Promise((res) => setTimeout(res, 1200)); // mock delay
      message.success("อัปโหลดสลิปสำเร็จ 🎉");
      setUploadModalOpen(false);

      setShowFullScreenLoader(true);
      setTimeout(() => {
        setShowFullScreenLoader(false);
        localStorage.removeItem(countdownKey);
        navigate("/e-ticket", {
          state: { bookingId, showDate, showTime, zone, seatNo, quantity: qty },
          replace: true,
        });
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      message.error("อัปโหลดล้มเหลว กรุณาลองใหม่");
      setLoadingUpload(false);
    }
  };

  const TextStyle = {
    fontSize: "18px",
    color: "#00306E",
    fontWeight: "bold",
  } as const;

  // helper: map icon ตามชื่อประเภท
  const iconForRefundType = (label: string) => {
    const lower = (label || "").toLowerCase();
    if (lower.includes("non") && lower.includes("refundable"))
      return <LuShieldX style={{ fontSize: 40 }} />;
    return <LuShieldCheck style={{ fontSize: 40 }} />;
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
              <span>{formatTime(paymentTimeLeft)}</span>
            </div>

            {/* Refund Type จาก Backend */}
            <Card className="payment-section" style={{ marginBottom: 24 }}>
              <Title
                level={4}
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LuShieldCheck style={{ marginRight: 8 }} /> Ticket Type
              </Title>

              <Row gutter={16}>
                {refundTypes.map((rt) => (
                  <Col xs={24} sm={12} key={rt.id}>
                    <Card
                      className={`option-card ${
                        selectedRefundTypeId === rt.id
                          ? "selected"
                          : "unselected"
                      }`}
                      onClick={() => setSelectedRefundTypeId(rt.id)}
                      hoverable
                    >
                      <div className="option-content">
                        <Checkbox
                          checked={selectedRefundTypeId === rt.id}
                          className="option-checkbox"
                        />
                        <div className="option-info">
                          {iconForRefundType(rt.refund_type)}
                          <Text
                            strong
                            style={{ marginTop: 8, display: "block" }}
                          >
                            {rt.refund_type}
                          </Text>
                          <Text style={{ display: "block", opacity: 0.8 }}>
                            Fee: {rt.refund_fee.toLocaleString()} THB
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* ช่องทางชำระเงิน */}
            <Card className="payment-section">
              <Title
                level={4}
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CreditCardOutlined style={{ marginRight: 8 }} /> Payment
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
                            style={{ marginTop: 8, display: "block" }}
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
                <Text strong style={{ fontSize: 18 }}>
                  รายการ/List
                </Text>
                <Text strong style={{ fontSize: 18 }}>
                  ราคา/Price
                </Text>
              </div>

              <div className="summary-item">
                <Text style={TextStyle}>
                  {qty} x {zone} {seatNo ? `(${seatNo})` : ""}
                </Text>
                <Text style={TextStyle}>{basePrice.toLocaleString()} THB</Text>
              </div>

              {discountValue !== 0 && (
                <div className="summary-item discount">
                  <Text style={{ color: "#52c41a", fontSize: 17 }}>
                    ส่วนลด/Discount
                  </Text>
                  <Text style={{ color: "#52c41a", fontSize: 17 }}>
                    {discountValue.toLocaleString()} THB
                  </Text>
                </div>
              )}

              {selectedRefundType && (
                <div className="summary-item">
                  <Text style={{ fontSize: 17 }}>
                    {selectedRefundType.refund_type}
                  </Text>
                  <Text style={{ fontSize: 17 }}>
                    {selectedRefundType.refund_fee.toLocaleString()} THB
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
                    className="payment-button"
                    style={{ marginTop: 16 }}
                    loading={loadingPayment}
                    onClick={handleConfirmPayment}
                  >
                    Payment
                  </Button>

                  <Button
                    type="primary"
                    className="payment-button"
                    onClick={handleOpenUploadModal}
                    style={{ marginTop: 16, backgroundColor: "#00b40c" }}
                  >
                    Upload Receipt
                  </Button>
                </Space>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      {/* PromptPay QR Modal */}
      <Modal
        open={isQRModalVisible}
        onCancel={() => setQRModalVisible(false)}
        footer={null}
        centered
        width={300}
      >
        <QRPromptPay amount={totalPrice} />
        <Alert
          type="warning"
          showIcon
          style={{ marginTop: 16, textAlign: "center" }}
          message={`QR จะหมดอายุภายใน ${formatTime(paymentTimeLeft)} นาที`}
        />
      </Modal>

      {/* Upload Slip Modal */}
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
