import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../../component/layout/navbar";
import { Button, Card, Col, Divider, Input, Row } from "antd";
import {
  CalendarDays,
  MapPin,
  Ticket,
  User,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form } from "antd";
import { RxCrossCircled } from "react-icons/rx";
import { useAuth } from "../../../hook/authContext";
import { promotionAPI } from "../../../services/https";

const BookingDetail: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state (from select-seat page)
  const {
    showDate,
    showTime,
    zone,
    seatNo,
    quantity,
    unitPrice,
    concertInfo,
    bookingData,
    bookingId,
  } = location.state || {};

  useEffect(() => {
    console.log("Received state from SelectSeat:", location.state);
  }, []);

  // Use mock data as fallback or for initial structure
  const ticketInfo = {
    zone: zone || "N/A",
    seatNo: seatNo || "N/A",
    quantity: quantity || 0,
    unitPrice: unitPrice || 0,
  };

  const [memberForm] = Form.useForm();
  const [discountCode, setDiscountCode] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    amount: number;
    message: string;
    code: string;
    promtionID?: number;
  } | null>(null);

  // Initialize member form with mock data
  useEffect(() => {
    memberForm.setFieldsValue(user);
  }, [memberForm]);
  const COUNTDOWN_SECONDS = 300; // countdown 5 minutes
  const [remainingTime, setRemainingTime] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const key = `booking_start_time_${bookingId}`;
    const now = Date.now();

    const storedStart = localStorage.getItem(key);
    let startTime = storedStart ? parseInt(storedStart, 10) : NaN;

    // ถ้าไม่มีค่า หรือค่าเก่าเกินเวลาแล้ว → รีเซ็ตเริ่มใหม่
    if (
      !storedStart ||
      isNaN(startTime) ||
      (now - startTime) / 1000 >= COUNTDOWN_SECONDS
    ) {
      startTime = now;
      localStorage.setItem(key, String(startTime));
      setRemainingTime(COUNTDOWN_SECONDS);
    } else {
      const elapsed = Math.floor((now - startTime) / 1000);
      setRemainingTime(Math.max(COUNTDOWN_SECONDS - elapsed, 0));
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const timeLeft = COUNTDOWN_SECONDS - elapsed;

      if (timeLeft <= 0) {
        clearInterval(timer);
        localStorage.removeItem(key);
        setRemainingTime(0);
        navigate(`/concert/${concertInfo?.ID}/selectzone`, { replace: true });
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
    // ใส่ dependency ให้ครบเพื่อความปลอดภัย
  }, [bookingId, concertInfo?.ID, COUNTDOWN_SECONDS, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleApplyDiscount = async () => {
    try {
      const payload = {
        code: discountCode,
        target:
          seatNo?.toLowerCase() === "standing" || seatNo ? "ticket" : "product",
        concert_id: concertInfo?.ID,
      };
      const res = await promotionAPI.validateCode(payload);
      if (res?.data?.valid) {
        const pct = res.data.data.discount_percent ?? 0;
        const promotionID = res?.data?.data?.promotion_id;
        const amount = Math.round((unitPrice * quantity * pct) / 100);
        setAppliedDiscount({
          amount,
          message: `Applied ${pct}% discount`,
          code: res.data.data.code,
          promtionID: promotionID,
        });
      } else {
        setAppliedDiscount({
          amount: 0,
          message: res?.data?.error || "The discount code is invalid",
          code: "",
          promtionID: undefined,
        });
      }
    } catch (e) {
      setAppliedDiscount({
        amount: 0,
        message: "Cannot validate the code",
        code: "",
        promtionID: undefined,
      });
    }
  };

  const subtotal = ticketInfo.unitPrice * ticketInfo.quantity;
  const discountAmount = appliedDiscount ? appliedDiscount.amount : 0;
  const fee = 0; // As per image
  const totalAmount = subtotal - discountAmount + fee;

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };
  const memberData = memberForm.getFieldsValue();
  const hasNavigated = useRef(false);

  const handleConfirm = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    const bookingInfo = {
      showDate,
      showTime,
      show:showDate+ " "+showTime,
      zone: zone,
      seatNo: seatNo,
      quantity: quantity,
      unitPrice: unitPrice,
      discount: appliedDiscount?.amount || 0,
      promotionID: appliedDiscount?.promtionID,
      member: memberData,
      bookingData,
      bookingId,
    };

    navigate("/payment", { state: bookingInfo });
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          padding: "30px 100px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <Row gutter={[30, 30]} justify="center">
          {/* Left Column: Concert, Ticket, Member Information */}
          <Col xs={24} lg={14}>
            <Card
              style={{
                borderColor: "#d3d3d3ff",
                backgroundColor: "#F6F6F8",
                borderRadius: 15,
                padding: "20px",
                height: "720px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
              bodyStyle={{ padding: "24px" }}
            >
              {/* Concert Information */}
              <div style={{ marginBottom: "30px" }}>
                <h2
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "22px",
                    fontWeight: "bold",
                    marginTop: -10,
                  }}
                >
                  <CalendarDays size={24} /> Concert Information
                </h2>
                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    margin: "10px 0 5px 0",
                  }}
                >
                  {concertInfo?.concert_name}
                </h3>
                <p
                  style={{
                    fontSize: "18px",
                    margin: "0 0 15px 0",
                    color: "#555",
                  }}
                >
                  {concertInfo.artist}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "16px",
                    color: "#666",
                  }}
                >
                  <CalendarDays size={18} /> {showDate}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "16px",
                    color: "#666",
                    marginTop: "5px",
                  }}
                >
                  <MapPin size={18} /> {concertInfo?.venue?.venue_name}
                </div>
              </div>

              <Divider style={{ borderColor: "#d3d3d3ff", margin: "20px 0" }} />

              {/* Ticket Information */}
              <div style={{ marginBottom: "30px" }}>
                <h2
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "22px",
                    fontWeight: "bold",
                  }}
                >
                  <Ticket size={24} /> Ticket Information
                </h2>
                <Row style={{ marginTop: "15px", fontSize: "16px" }}>
                  <Col span={12}>Zone:</Col>
                  <Col span={12}>
                    <strong>{ticketInfo.zone}</strong>
                  </Col>
                  <Col span={12}>Seat No:</Col>
                  <Col span={12}>
                    <strong>{ticketInfo.seatNo}</strong>
                  </Col>
                  <Col span={12}>Quantity:</Col>
                  <Col span={12}>
                    <strong>{ticketInfo.quantity}</strong>
                  </Col>
                  <Col span={12}>Unit Price(THB):</Col>
                  <Col span={12}>
                    <strong>{ticketInfo.unitPrice.toLocaleString()}</strong>
                  </Col>
                </Row>
              </div>

              <Divider style={{ borderColor: "#d3d3d3ff", margin: "20px 0" }} />

              {/* Member Information */}
              <div>
                <h2
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "22px",
                    fontWeight: "bold",
                  }}
                >
                  <User size={24} /> Member Information
                </h2>
                <Form
                  form={memberForm}
                  layout="vertical"
                  style={{ marginTop: "15px" }}
                  disabled
                >
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="Firstname" name="firstname">
                        <Input size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Lastname" name="lastname">
                        <Input size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="Email" name="email">
                        <Input size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Tel" name="phonenum">
                        <Input size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Card>
          </Col>

          {/* Right Column: Discount Code & Order Summary */}
          <Col xs={24} lg={10}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "30px" }}
            >
              {/* Timer */}
              <div className="timer-badge">
                <Clock size={20} /> {formatTime(remainingTime)}
              </div>

              <Card
                style={{
                  borderColor: "#d3d3d3ff",
                  backgroundColor: "#F6F6F8",
                  borderRadius: 15,
                  padding: "20px",
                  marginLeft: "70px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                {/* Discount Code */}
                <div style={{ marginBottom: "20px" }}>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: "bold",
                      marginBottom: "15px",
                      marginTop: -20,
                    }}
                  >
                    Discount code
                  </h2>
                  <Input.Group compact style={{ display: "flex" }}>
                    <Input
                      style={{ flex: 1 }}
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      size="large"
                    />
                    <Button
                      type="primary"
                      onClick={handleApplyDiscount}
                      size="large"
                    >
                      use
                    </Button>
                  </Input.Group>
                  {appliedDiscount && (
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: appliedDiscount.code ? "#00c50aff" : "red",
                      }}
                    >
                      {appliedDiscount.code ? (
                        <>
                          <CheckCircle size={16} /> {appliedDiscount.message}
                        </>
                      ) : (
                        <>
                          <RxCrossCircled size={16} /> {appliedDiscount.message}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Divider
                  style={{ borderColor: "#d3d3d3ff", margin: "20px 0" }}
                />

                {/* Order Summary */}
                <div>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: "bold",
                      marginBottom: "15px",
                    }}
                  >
                    Order Summary
                  </h2>
                  <Row style={{ fontSize: "16px", marginBottom: "5px" }}>
                    <Col span={12}>
                      Unit Price({ticketInfo.quantity} Ticket):
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                      {subtotal.toLocaleString()} THB
                    </Col>
                  </Row>
                  {appliedDiscount && (
                    <Row
                      style={{
                        fontSize: "16px",
                        marginBottom: "5px",
                        color: appliedDiscount.code ? "#00c50aff" : "red",
                      }}
                    >
                      <Col span={12}>Discount ({appliedDiscount.code}):</Col>
                      <Col span={12} style={{ textAlign: "right" }}>
                        -{discountAmount.toLocaleString()} THB
                      </Col>
                    </Row>
                  )}
                  <Row style={{ fontSize: "16px", marginBottom: "15px" }}>
                    <Col span={12}>fee:</Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                      {fee.toLocaleString()} THB
                    </Col>
                  </Row>
                  <Divider
                    style={{ borderColor: "#d3d3d3ff", margin: "10px 0" }}
                  />
                  <Row style={{ fontSize: "20px", fontWeight: "bold" }}>
                    <Col span={12}>Total Price</Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                      {totalAmount.toLocaleString()} THB
                    </Col>
                  </Row>
                </div>

                {/* Buttons */}
                <div
                  style={{
                    marginTop: "30px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                  }}
                >
                  <Button
                    onClick={handleCancel}
                    size="large"
                    style={{
                      height: 48,
                      fontSize: 20,
                      padding: "0 24px",
                      borderRadius: 10,
                      // backgroundColor: "#e2e8f0", // Gray background
                      // borderColor: "#e2e8f0",
                      // color: "#4a5568", // Darker gray text
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleConfirm}
                    size="large"
                    style={{
                      height: 48,
                      fontSize: 20,
                      padding: "0 24px",
                      borderRadius: 10,
                      // backgroundColor: "#00306E", // Dark blue
                      // borderColor: "#00306E",
                      color: "white",
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default BookingDetail;
