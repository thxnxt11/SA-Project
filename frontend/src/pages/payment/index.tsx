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
import ETicketSuccess from "../e-ticket/show_ticket";
import type { Ticket } from "../e-ticket/show_ticket";

const { Title, Text } = Typography;

interface RefundType {
  id: number;
  refund_type: string;
  refund_fee: number;
}

interface PaymentMethod {
  id: number;
  payment_method: string;
  account_name?: string;
  account_number?: string;
  bank_name?: string;
}

const Payment: React.FC = () => {
  // ── Routing state
  const location = useLocation();
  const navigate = useNavigate();
  const {
    // show,
    zone,
    seatNo,
    quantity,
    unitPrice,
    discount,
    bookingId,
    promotionID,
  } = (location.state as any) || {};

  useEffect(() => {
    if (!location.state) navigate("/concerts", { replace: true });
  }, [location.state, navigate]);

  const [refundTypes, setRefundTypes] = useState<RefundType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  // ── Selections
  const [selectedRefundTypeId, setSelectedRefundTypeId] = useState<
    number | null
  >(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    number | null
  >(null);

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [isQRModalVisible, setQRModalVisible] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);
  const [showETicketSuccess, setShowETicketSuccess] = useState(false);
  const [ticketsData, setTicketsData] = useState<Ticket[]>([]);
  // ── Loading flags
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [refundRes, paymethodRes] = await Promise.all([
          paymentAPI.getAllRefundTypes(),
          paymentAPI.getAllPaymentMethods(),
        ]);
        if (refundRes?.status === 200 && Array.isArray(refundRes.data)) {
          setRefundTypes(refundRes.data);
          if (refundRes.data.length > 0)
            setSelectedRefundTypeId(refundRes.data[0].id);
        }
        if (paymethodRes?.status === 200 && Array.isArray(paymethodRes.data)) {
          setPaymentMethods(paymethodRes.data);
          if (paymethodRes.data.length > 0)
            setSelectedPaymentMethodId(paymethodRes.data[0].id);
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

  const basePrice = unitPrice ?? 0;
  const price = basePrice * quantity;
  const qty = quantity ?? 1;
  const discountValue = discount ?? 0;
  const extraRefundFee = selectedRefundType?.refund_fee ?? 0;

  const totalPrice = useMemo(
    () => basePrice * qty - discountValue + extraRefundFee,
    [basePrice, qty, discountValue, extraRefundFee]
  );

  // Countdown for payment
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

  const iconForRefundType = (label: string) => {
    const lower = (label || "").toLowerCase();
    if (lower.includes("non") && lower.includes("refundable")) {
      return <LuShieldX style={{ fontSize: 40 }} />;
    }
    return <LuShieldCheck style={{ fontSize: 40 }} />;
  };

  const iconForPayment = (name?: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("prompt") || n.includes("bank")) {
      return <BankOutlined style={{ fontSize: 40, color: "#1890ff" }} />;
    }
    if (n.includes("true")) {
      return <WalletOutlined style={{ fontSize: 40, color: "#ff4d4f" }} />;
    }
    return <CreditCardOutlined style={{ fontSize: 40 }} />;
  };

  // Bank modal data
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

  // Handlers
  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethodId) {
      message.warning("กรุณาเลือกช่องทางการชำระเงิน");
      return;
    }

    setLoadingPayment(true);
    try {
      const payload = {
        booking_id: bookingId,
        payment_method_id: selectedPaymentMethodId,
        refund_type_id: selectedRefundTypeId ?? undefined,
        promotion_id: promotionID ?? undefined,
        base_price: price,
        discount: discountValue,
        refund_fee: extraRefundFee,
        total_price: totalPrice,
      };

      const res = await paymentAPI.create(payload);
      // รองรับทั้งรูปแบบที่ backend ส่ง id ตรงและห่อใน object
      const newPaymentId =
        res?.data?.payment_id?.ID ??
        res?.data?.payment_id ??
        res?.data?.id ??
        null;

      setPaymentId(newPaymentId);

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

  const fetchETickets = async (bkId: number): Promise<Ticket[]> => {
    const res = await paymentAPI.getETicketByBookingId(bkId);
    const list = Array.isArray(res?.data) ? res.data : res?.data?.data;
    if (!Array.isArray(list)) return [];

    // map snake_case -> camelCase ให้ตรงกับ Ticket
    return list.map((it: any): Ticket => {
      return {
        uuid: it.uuid, // standing = booking_code, seating = ticket_uuid
        concertName: it.concert_name,
        venueName: it.venue_name,
        showTimeISO: it.show_time_iso,
        bookingCode: it.booking_code,
        zoneType: it.zone_type,
        zone: it.zone,
        seatLabel: it.seat_label ?? undefined,
        queueNumber: it.queue_number ?? undefined, // คอมโพเนนต์ ETicketSuccess รองรับ field นี้
        priceTHB: it.price,
      };
    });
  };

  const handleUploadAndUpdate = async (file: File) => {
    setLoadingUpload(true);
    try {
      // 1) upload สลิป
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadAPI.upload(formData);
      const url: string = res?.data?.data?.url;
      console.log("path: ", url);
      if (!paymentId) {
        message.info("กำลังสร้างรายการชำระเงิน...");
        return;
      }
      if (!url) {
        message.warning("ยังไม่มีสลิปที่อัปโหลดสำเร็จ");
        return;
      }

      // 2) update receipt
      await paymentAPI.updateReceipt(paymentId, { receipt_url: url });

      // 3) ดึง e-tickets จาก bookingId
      if (!bookingId) {
        message.warning("ไม่พบหมายเลขการจอง");
        return;
      }

      const tickets = await fetchETickets(Number(bookingId));
      if (tickets.length === 0) {
        message.warning("ยังไม่สามารถออก e-ticket ได้ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      setTicketsData(tickets);
      setShowETicketSuccess(true);
      setUploadModalOpen(false);

      // เคลียร์ state countdown
      setTimeout(() => {
        setShowFullScreenLoader(false);
        localStorage.removeItem(countdownKey);
      }, 300);

      message.success("อัปโหลดและออก E-Ticket สำเร็จ 🎉");
    } catch (e) {
      console.error(e);
      message.error("อัปโหลดหรืออัปเดตล้มเหลว");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleOpenUploadModal = () => setUploadModalOpen(true);
  const handleCloseUploadModal = () => setUploadModalOpen(false);
  const handleCloseTicket = () => {
    navigate("/concerts");
  };
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
          {/* Left: options */}
          <Col xs={24} lg={16}>
            <div className="timer-badge">
              <ClockCircleOutlined />
              <span>{formatTime(paymentTimeLeft)}</span>
            </div>

            {/* Refund Types */}
            <Card className="payment-section" style={{ marginBottom: 24 }}>
              <Title
                level={4}
                // style={{
                //   marginBottom: 16,
                //   display: "flex",
                //   alignItems: "center",
                // }}
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

            {/* Payment Methods */}
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

          {/* Right: summary */}
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

      {/* Bank Account Modal */}
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

      <ETicketSuccess
        open={showETicketSuccess}
        tickets={ticketsData}
        onClose={handleCloseTicket}
      />
    </>
  );
};

export default Payment;
