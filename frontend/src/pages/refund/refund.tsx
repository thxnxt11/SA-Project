import {
  Button,
  Card,
  Form,
  Row,
  Col,
  Select,
  message,
  Spin,
  Input,
} from "antd";
import Title from "antd/es/typography/Title";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type {
  Bank,
  RefundRequest,
  RefundableBooking,
} from "../../interface/refund";
import { refundAPI } from "../../services/https";
import Navbar from "../../component/layout/navbar";
import { useAuth } from "../../hook/authContext";

const { TextArea } = Input;

export const Refund = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [refundableBookings, setRefundableBookings] = useState<
    RefundableBooking[]
  >([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBookingCode, setSelectedBookingCode] = useState<string | null>(
    null
  );
  const [selectedBankId, setSelectedBankId] = useState<number | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // ดึง refundable bookings
  useEffect(() => {
    if (!userId) return;

    const fetchRefundableBookings = async () => {
      try {
        setLoading(true);
        const data = await refundAPI.getRefundableBookings(Number(userId));
        setRefundableBookings(data.refundable_bookings ?? []);

        if (data.refundable_bookings.length === 0) {
          message.info("คุณไม่มีการจองที่สามารถขอคืนเงินได้");
        } else {
          setSelectedBookingCode(
            data.refundable_bookings[0]?.booking_code ?? null
          );
        }
      } catch (error) {
        console.error("Error fetching refundable bookings:", error);
        setRefundableBookings([]);
        message.error("ไม่สามารถดึงข้อมูลการจองได้");
      } finally {
        setLoading(false);
      }
    };

    fetchRefundableBookings();
  }, [userId]);

  // ดึงธนาคาร
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const data = await refundAPI.getBanks();
        setBanks(data ?? []);
      } catch (error) {
        console.error("Error fetching banks:", error);
        setBanks([]);
        message.error("ไม่สามารถดึงข้อมูลธนาคารได้");
      }
    };

    fetchBanks();
  }, []);

  const handleBookingChange = (bookingCode: string) => {
    setSelectedBookingCode(bookingCode);
  };
  const handleBankChange = (value: number) => {
    setSelectedBankId(value);
  };
  const handleSubmit = async (values: RefundRequest) => {
    if (!userId) {
      message.error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

    if (!values.booking_code) {
      message.error("กรุณาเลือกการจอง");
      return;
    }
    if (!values.bank_id) {
      message.error("กรุณาเลือกธนาคาร");
      return;
    }
    console.log({
      booking_code: values.booking_code,
      reason: values.reason,
      bank_number: values.bank_number,
      bank_id: values.bank_id,
    });
    try {
      setSubmitLoading(true);
      await refundAPI.createRefund(Number(userId), {
        booking_code: values.booking_code,
        reason: values.reason,
        bank_number: values.bank_number,
        bank_id: Number(values.bank_id), // แปลงเป็น number แน่นอน
      });
      message.success("ส่งคำขอคืนเงินสำเร็จแล้ว");
      form.resetFields();
      navigate("/");
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      message.error("เกิดข้อผิดพลาดในการส่งคำขอคืนเงิน");
    } finally {
      setSubmitLoading(false);
    }
  };

  const goToHistory = () => navigate("/historyrefund");

  const bookingOptions = refundableBookings.map((b) => ({
    value: b.booking_code,
    label: b.booking_code,
  }));
  const bankOptions = banks.map((b) => ({
    value: b.id, // number
    label: b.bank_name,
  }));

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        paddingBottom: 50,
      }}
    >
      <Navbar />
      <Row
        style={{
          width: 1300,
          margin: "20px auto",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2}>Refund</Title>
        <Button
          type="primary"
          style={{
            width: 150,
            height: 40,
            backgroundColor: "#00306E",
            color: "#ffffff",
            fontSize: 18,
          }}
          onClick={goToHistory}
        >
          History
        </Button>
      </Row>

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ width: 1300, margin: "0 auto" }}
        >
          <Card style={{ borderRadius: 10, minHeight: 400 }}>
            <Form.Item
              name="booking_code"
              label="เลือกการจอง"
              rules={[{ required: true, message: "กรุณาเลือกการจอง" }]}
            >
              <Select
                showSearch
                style={{ width: "100%", height: 40 }}
                placeholder={
                  refundableBookings.length === 0
                    ? "ไม่มีการจองที่สามารถขอคืนเงินได้"
                    : "เลือกการจอง"
                }
                options={bookingOptions}
                onChange={handleBookingChange}
                disabled={refundableBookings.length === 0}
                value={selectedBookingCode || undefined}
              />
            </Form.Item>

            {selectedBookingCode && (
              <div
                style={{
                  width: "100%",
                  marginBottom: 20,
                  padding: 15,
                  backgroundColor: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: 6,
                }}
              >
                <p style={{ color: "#1890ff", fontSize: "14px" }}>
                  ℹ️ กรุณากรอกข้อมูลธนาคารและเหตุผลด้านล่าง
                </p>
              </div>
            )}

            <Row gutter={40}>
              <Col span={12}>
                <Form.Item
                  name="bank_id"
                  label="ธนาคาร"
                  rules={[{ required: true, message: "กรุณาเลือกธนาคาร" }]}
                >
                  <Select
                    showSearch
                    style={{ width: "100%", height: 40 }}
                    placeholder="เลือกธนาคาร"
                    options={bankOptions}
                    onChange={handleBankChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="bank_number"
                  label="เลขที่บัญชี"
                  rules={[
                    { required: true, message: "กรุณากรอกเลขที่บัญชี" },
                    { min: 10, message: "เลขที่บัญชีต้องมีอย่างน้อย 10 หลัก" },
                    { max: 20, message: "เลขที่บัญชีต้องมีไม่เกิน 20 หลัก" },
                    {
                      pattern: /^[0-9]+$/,
                      message: "เลขที่บัญชีต้องเป็นตัวเลขเท่านั้น",
                    },
                  ]}
                >
                  <Input
                    style={{ width: "100%", height: 40 }}
                    placeholder="กรอกเลขที่บัญชี"
                    maxLength={20}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="reason"
              label="เหตุผลในการขอคืนเงิน"
              rules={[
                { required: true, message: "กรุณากรอกเหตุผล" },
                { min: 10, message: "เหตุผลต้องมีอย่างน้อย 10 ตัวอักษร" },
              ]}
            >
              <TextArea
                showCount
                maxLength={500}
                style={{ width: "100%", height: 90 }}
                placeholder="กรุณาระบุเหตุผลในการขอคืนเงิน"
                rows={4}
              />
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                disabled={
                  !selectedBookingCode || refundableBookings.length === 0
                }
                style={{
                  width: 150,
                  marginTop: 30,
                  height: 40,
                  backgroundColor: "#00306E",
                  color: "#ffffff",
                  fontSize: 18,
                }}
              >
                ส่งคำขอ
              </Button>
            </div>
          </Card>
        </Form>
      </Spin>
    </div>
  );
};
