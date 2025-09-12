import React, { useState, useEffect } from "react";
import "../payment/payment.css";
import { Row, Col, Card, Typography, Checkbox, Button, Space, message, Modal, Alert } from "antd";
import { CreditCardOutlined, WalletOutlined, BankOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import QRPromptPay from "./promptpay_qr";
import { UploadModal } from "./upload";
import { paymentOrderAPI, uploadAPI } from "../../../services/https";
import BankAccountModal from "../../../component/payment/BankAccountModal";
import SuccessModal from "./successModal";
import Navbar from "../../../component/layout/navbar";

const { Title, Text } = Typography;
const { Meta } = Card;

const PaymentOrderPage: React.FC = () => {
  const { id } = useParams();
  const paymentId = Number(id);
  const navigate =useNavigate();
  const location = useLocation();
  const { selectedItems = [] } = location.state || {};
  
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  
  const PAY_TIMELEFT = 600; // 10 mins
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(PAY_TIMELEFT);
  
  const [QRModalVisible, setQRModalVisible] = useState(false);
  const handleCloseUploadModal = () => setUploadModalOpen(false);

  useEffect(() => {
  const startTime = Date.now(); 

  const timer = setInterval(async () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const timeLeft = PAY_TIMELEFT - elapsed;

    if (timeLeft <= 0) {
      clearInterval(timer);
      setPaymentTimeLeft(0);
      message.error("หมดเวลาการชำระเงิน");
      try {
        await paymentOrderAPI.expirePaymentOrder(paymentId);
      } catch (e) {
        console.error("Failed to expire payment order:", e);
      }
      navigate("/concerts", { replace: true });
    } else {
      setPaymentTimeLeft(timeLeft);
    }
  }, 1000);

  return () => clearInterval(timer);
}, [paymentId, navigate]);


  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await paymentOrderAPI.getPaymentOrderById(paymentId);
        const order = res.data.payment_order;

        setPaymentOrder({
          id: order.ID,
          discount: order.discount,       // Discount จาก backend
          totalPrice: order.total_price,  // TotalPrice จาก backend
          receipt_url: order.receipt_url,
          paid_at: order.paid_at,
        });
        const methodsRes = await paymentOrderAPI.getAllPaymentMethods();
        setPaymentMethods(methodsRes.data);


        console.log("PaymetnOrders: ",res.data.payment_order);
      } catch (e) {
        console.error(e);
        message.error("ไม่สามารถดึงข้อมูลเริ่มต้นได้");
      }
    })();
  }, []);


  const selectedMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);

  const bankInfo = selectedPaymentMethodId
  ? {
      id: selectedMethod.id,
      bank_name: selectedMethod.bank_name,
      account_name: selectedMethod.account_name,
      account_number: selectedMethod.account_number,
      note: `หลังโอนกรุณาอัปโหลดสลิปภายใน ${formatTime(paymentTimeLeft)} นาทีเพื่อยืนยันรายการ`,
      total_price: paymentOrder?.totalPrice,
    }
  : null;

  const iconForPayment = (name?: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("prompt")) {
      return <BankOutlined style={{ fontSize: 40, color: "#1890ff" }} />;
    }
    if (n.includes("true")) {
      return <WalletOutlined style={{ fontSize: 40, color: "#ff4d4f" }} />;
    }
    return <CreditCardOutlined style={{ fontSize: 40 }} />;
  };

  // เมื่อกด Payment
  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethodId) {
      message.warning("กรุณาเลือกช่องทางการชำระเงิน");
      return;
    }
    
    setLoadingPayment(true);
    try {
      const methodName = (
        selectedMethod?.payment_method || ""
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
  
  const orderForModal = paymentOrder ? {
    id: paymentOrder.id,
    items: selectedItems,
    totalPrice: selectedItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0) - (paymentOrder.discount || 0),
    discount: paymentOrder.discount || 0,
    paid_at: paymentOrder.paid_at,
  } : null;

  const handleUploadAndUpdate = async (file: File) => {
  if (!selectedPaymentMethodId) {
    message.warning("กรุณาเลือกวิธีชำระเงินก่อนอัปโหลดสลิป");
    return;
  }

  setLoadingUpload(true);
    try {
      const res = await uploadAPI.uploadReceipt(file);
      const receiptUrl = res.data.data.url;
      console.log(res.data.data.url);
      
      await paymentOrderAPI.updatePaymentOrder(paymentId, {
      method_id: selectedPaymentMethodId,
      status_id: 2,
      receipt_url: receiptUrl,
    });

      message.success("อัปโหลดสลิปและอัปเดตการชำระเงินเรียบร้อย");
      setUploadModalOpen(false);
      setSuccessModalOpen(true);
    } catch (e) {
      console.error(e);
      message.error("อัปโหลดหรืออัปเดตไม่สำเร็จ");
    } finally {
      setLoadingUpload(false);
    }
  };

  const TextStyle = {
      fontSize: "18px",
      color: "#00306E",
      fontWeight: "bold",
    } as const;

  
  return (
    <>
      <Navbar/>
      <div className="payment-container">
          <Col xs={24} lg={16}
            style={{margin:"20px auto"}}
            >
            <Card className="payment-section" >
              <Meta 
                title={<span style={{ fontSize: 24, fontWeight: 'bold' }}>Payment Methods</span>} 
                description={<span style={{ fontSize: 16, margin:10}}>เลือกช่องทางการชำระเงิน</span>}
                />
              <Row gutter={[16, 16] }>
                {paymentMethods.map((pm) => (
                  <Col xs={24} sm={12} key={pm.id} >
                    <Card
                      className={`option-card ${selectedPaymentMethodId === pm.id ? "selected" : "unselected"}`}
                      hoverable
                      onClick={() => setSelectedPaymentMethodId(pm.id)}
                      >
                      <Checkbox checked={selectedPaymentMethodId === pm.id} />
                      <div className="option-info">{iconForPayment(pm.payment_method)}</div>
                      <Text strong>{pm.payment_method}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          {/* Right: Summary */}
          <Col xs={24} lg={8} 
          style={{margin: "0 auto"}}>
            <Card 
              className="price-summary"
              >
              <Title level={4} >Order Summary</Title>
              <div className="summary-header">
                  <Text strong style={{ fontSize: 18 }}>
                    รายการ/List
                  </Text>
                  <Text strong style={{ fontSize: 18 }}>
                    ราคา/Price
                  </Text>
              </div>
              <div style={{ marginBottom: 16 }}>
                {selectedItems.map((item: any) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text>{item.name} x {item.quantity}</Text>
                    <Text>{(item.price * item.quantity).toLocaleString()} THB</Text>
                  </div>
                ))}
              </div>

              {paymentOrder?.discount !== 0 && (
                <div className="summary-item discount">
                    <Text style={{ color: "#52c41a", fontSize: 17 }}>
                      ส่วนลด/Discount
                    </Text>
                    <Text style={{ color: "#52c41a", fontSize: 17 }}>
                      {paymentOrder?.discount.toLocaleString()} THB
                    </Text>
                  </div>
                )}
              <div className="summary-divider" />
              <div className="summary-total">
                <Text strong style={TextStyle}>
                    ราคา/Total Price
                  </Text>
                  <Text strong style={TextStyle}>
                    {paymentOrder?.totalPrice.toLocaleString()} THB
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
                      onClick={() => setUploadModalOpen(true)}
                      style={{ marginTop: 16, backgroundColor: "#00b40c" }}
                      >
                      Upload Receipt
                    </Button>
                  </Space>
                </Row>

            </Card>
          </Col>
        <Modal
          open={QRModalVisible}
          onCancel={() => setQRModalVisible(false)}
          footer={null}
          centered
          width={300}
          >
          <QRPromptPay amount={paymentOrder?.totalPrice}  />
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
        <SuccessModal
          open={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          order={orderForModal}
          />
      </div>
    </>
  );
};

export default PaymentOrderPage;
