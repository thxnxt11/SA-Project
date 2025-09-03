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
import { paymentAPI, uploadAPI } from "../../services/https";
import BankAccountModal from "../../component/payment/BankAccountModal";

const { Title, Text } = Typography;

interface RefundType {
  id: number;
  refund_type: string;
  refund_fee: number;
}

interface PaymentMethod {
  id: number;
  payment_method: string; // e.g. "PromptPay", "Bank Transfer", "TrueMoney"
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
    promotionID,
  } = (location.state as any) || {};

  useEffect(() => {
    if (!location.state) {
      navigate("/concerts", { replace: true });
    }
  }, [location.state, navigate]);

  // ===== Fetch data from backend =====
  const [refundTypes, setRefundTypes] = useState<RefundType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedRefundTypeId, setSelectedRefundTypeId] = useState<
    number | null
  >(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    number | null
  >(null);

  useEffect(() => {
    (async () => {
      try {
        const [rtRes, pmRes] = await Promise.all([
          paymentAPI.getAllRefundTypes(),
          paymentAPI.getAllPaymentMethods(),
        ]);
        if (rtRes?.status === 200 && Array.isArray(rtRes.data)) {
          setRefundTypes(rtRes.data);
          if (rtRes.data.length > 0) setSelectedRefundTypeId(rtRes.data[0].id);
        }
        if (pmRes?.status === 200 && Array.isArray(pmRes.data)) {
          setPaymentMethods(pmRes.data);
          if (pmRes.data.length > 0)
            setSelectedPaymentMethodId(pmRes.data[0].id);
        }
      } catch (e) {
        console.error(e);
        message.error("ไม่สามารถดึงข้อมูลเริ่มต้นได้");
      }
    })();
  }, []);

  const selectedRefundType = useMemo(
    () => refundTypes.find((r) => r.id === selectedRefundTypeId) || null,
    [refundTypes, selectedRefundTypeId]
  );
  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethods.find((pm) => pm.id === selectedPaymentMethodId) || null,
    [paymentMethods, selectedPaymentMethodId]
  );

  // ===== Price =====
  const basePrice = unitPrice ?? 0;
  const qty = quantity ?? 1;
  const discountValue = discount ?? 0;
  const extraRefundFee = selectedRefundType?.refund_fee ?? 0;

  const totalPrice = useMemo(
    () => basePrice * qty - discountValue + extraRefundFee,
    [basePrice, qty, discountValue, extraRefundFee]
  );

  // ===== Timer =====
  const PAY_TIMELEFT = 600; // 10 mins
  const countdownKey = `booking_start_time_${bookingId ?? "temp"}`;
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(PAY_TIMELEFT);

  useEffect(() => {
    const storedStartTime = localStorage.getItem(countdownKey);
    let startTime = storedStartTime
      ? parseInt(storedStartTime, 10)
      : Date.now();
    if (!storedStartTime)
      localStorage.setItem(countdownKey, startTime.toString());

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

  // ===== Icons helper =====
  const iconForRefundType = (label: string) => {
    const lower = (label || "").toLowerCase();
    if (lower.includes("non") && lower.includes("refundable"))
      return <LuShieldX style={{ fontSize: 40 }} />;
    return <LuShieldCheck style={{ fontSize: 40 }} />;
  };

  const iconForPayment = (name?: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("prompt") || n.includes("bank"))
      return <BankOutlined style={{ fontSize: 40, color: "#1890ff" }} />;
    if (n.includes("true"))
      return <WalletOutlined style={{ fontSize: 40, color: "#ff4d4f" }} />;
    return <CreditCardOutlined style={{ fontSize: 40 }} />;
  };

  // ===== UI states for modals =====
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [isQRModalVisible, setQRModalVisible] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const bankInfo = selectedPaymentMethod
    ? {
        id: selectedPaymentMethod.id,
        bank_name: selectedPaymentMethod.bank_name,
        account_name: selectedPaymentMethod.account_name,
        account_number: selectedPaymentMethod.account_number,
        note: `หลังโอนกรุณาอัปโหลดสลิปภายใน ${formatTime(
          paymentTimeLeft
        )} นาทีเพื่อยืนยันรายการ`,
        total_price: totalPrice,
      }
    : null;
  // ===== Handlers =====
  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethodId) {
      message.warning("กรุณาเลือกช่องทางการชำระเงิน");
      return;
    }

    setLoadingPayment(true);
    try {
      // เตรียม payload ให้ตรงกับ backend createpayment
      const payload = {
        booking_id: bookingId,
        payment_method_id: selectedPaymentMethodId,
        refund_type_id: selectedRefundTypeId ?? undefined,
        promotion_id: promotionID ?? undefined,
        base_price: basePrice,
        discount: discountValue,
        refund_fee: extraRefundFee,
        total_price: totalPrice,
      };

      const res = await paymentAPI.create(payload);
      const paymentID = res?.data?.payment_id?.ID ?? null;

      setPaymentId(paymentID);
      console.log("payment_id: ", paymentID);
      const methodName = (
        selectedPaymentMethod?.payment_method || ""
      ).toLowerCase();
      if (methodName.includes("prompt")) {
        setQRModalVisible(true);
      } else if (
        methodName.includes("account number") ||
        methodName.includes("bank")
      ) {
        setBankModalOpen(true);
      } else {
        message.success("เริ่มการชำระเงินเรียบร้อย");
      }
    } catch (e) {
      console.error(e);
      message.error("ไม่สามารถเริ่มการชำระเงินได้");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleUploadAndUpdate = async (file: File) => {
    setLoadingUpload(true);
    try {
      // 1) upload สลิป
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadAPI.upload(formData);
      const url: string = res?.data?.data?.url;
      console.log("file path: ", url);
      if (!paymentId) {
        message.info("กำลังสร้างรายการชำระเงิน...");
        return;
      }
      if (!url) {
        message.warning("ยังไม่มีสลิปที่อัปโหลดสำเร็จ");
        return;
      }
      // 2) update payment receipt

      await paymentAPI.updateReceipt(paymentId, { receipt_url: url });

      message.success("อัปโหลดและอัปเดต Payment Receipt สำเร็จ 🎉");
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
    } catch (e) {
      console.error(e);
      message.error("อัปโหลดหรืออัปเดตล้มเหลว");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleOpenUploadModal = async () => {
    setUploadModalOpen(true);
    //     try {
    // if (!paymentId) {
    //   message.info("กำลังสร้างรายการชำระเงิน...");
    //   return;
    // }
    // if (!receipturl) {
    //   message.warning("ยังไม่มีสลิปที่อัปโหลดสำเร็จ");
    //   return;
    // }
    // const payload = {
    //   payment_id: paymentId,
    //   receipt_url: receipturl,
    // };
    // const res = await paymentAPI.updateReceipt(payload.payment_id,payload.receipt_url);
    //       console.log("Reciept path: ",res)
    //       if (res?.status === 200) {
    //         message.success("บันทึกหลักฐานการชำระเงินเรียบร้อย");
    //       }
    //     }catch (e) {
    //         console.error(e);
    //         message.error("ไม่สามารถบันทึกหลักฐานการชำระเงินได้");
    //     }
  };
  const handleCloseUploadModal = () => setUploadModalOpen(false);
  const TextStyle = {
    fontSize: "18px",
    color: "#00306E",
    fontWeight: "bold",
  } as const;

  return (
    <>
      <Navbar />
      <div className="payment-container">
        <Row
          gutter={24}
          style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}
        >
          <Col xs={24} lg={16}>
            <div className="timer-badge">
              <ClockCircleOutlined />
              <span>{formatTime(paymentTimeLeft)}</span>
            </div>

            {/* Refund Types */}
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
                            {rt.id === 2
                              ? `Fee: ${rt.refund_fee.toLocaleString()} THB`
                              : "\u00A0"}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* Payment Methods (from API) */}
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
                {paymentMethods.map((pm) => (
                  <Col xs={24} sm={12} key={pm.id}>
                    <Card
                      className={`option-card ${
                        selectedPaymentMethodId === pm.id
                          ? "selected"
                          : "unselected"
                      }`}
                      onClick={() => setSelectedPaymentMethodId(pm.id)}
                      hoverable
                    >
                      <div className="option-content">
                        <Checkbox
                          checked={selectedPaymentMethodId === pm.id}
                          className="option-checkbox"
                        />
                        <div className="option-info">
                          {iconForPayment(pm.payment_method)}
                          <Text
                            strong
                            style={{ marginTop: 8, display: "block" }}
                          >
                            {pm.payment_method}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          {/* Summary */}
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

      <BankAccountModal
        open={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        data={bankInfo}
      />

      {/* Upload Slip Modal */}
      <UploadModal
        visible={uploadModalOpen}
        onClose={handleCloseUploadModal}
        onUpload={handleUploadAndUpdate}
        loading={loadingUpload}
      />

      {showFullScreenLoader && <Loader />}
    </>
  );
};

export default Payment;
