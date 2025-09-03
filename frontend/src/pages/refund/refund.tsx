import { Button, Card, Form, Row, Select, message, Spin, Input } from "antd";
import Title from "antd/es/typography/Title";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { BankOption, BookingInfo, RefundRequest } from "../../interface/refund";
import { refundAPI } from "../../services/https";
import Navbar from "../../component/layout/navbar";
import { useAuth } from "../../hook/authContext";

const { TextArea } = Input;

export const Refund = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<BookingInfo[]>([]);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // ดึงข้อมูล bookings และ banks เมื่อ userId โหลด
  useEffect(() => {
    if (!userId) return; // ยังไม่โหลด user
    fetchUserBookings();
    fetchBankOptions();
  }, [userId]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const response = await refundAPI.getUserBookings(Number(userId));
      if (response?.status === 200) {
        setBookings(response.data?.bookings ?? []);
      } else {
        setBookings([]);
        message.error('ไม่สามารถดึงข้อมูลการจองได้');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      message.error('ไม่สามารถดึงข้อมูลการจองได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankOptions = async () => {
    try {
      const response = await refundAPI.getBankOptions();
      if (response?.status === 200) {
        setBanks(response.data?.banks ?? []);
      } else {
        setBanks([]);
        message.error('ไม่สามารถดึงข้อมูลธนาคารได้');
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      setBanks([]);
      message.error('ไม่สามารถดึงข้อมูลธนาคารได้');
    }
  };

  const handleBookingChange = (bookingCode: string) => {
    const booking = bookings.find(b => b.booking_code === bookingCode);
    setSelectedBooking(booking || null);

    if (booking && !booking.can_refund) {
      message.warning('การจองนี้ไม่สามารถขอคืนเงินได้');
    }
  };

  const handleSubmit = async (values: RefundRequest) => {
    if (!userId) {
      message.error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
      return;
    }
    if (!selectedBooking?.can_refund) {
      message.error('การจองนี้ไม่สามารถขอคืนเงินได้');
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await refundAPI.createRefund(Number(userId), {
        booking_code: values.booking_code,
        reason: values.reason,
        bank_number: values.bank_number,
        bank_id: values.bank_id
      });

      if (response?.status === 201) {
        message.success('ส่งคำขอคืนเงินสำเร็จแล้ว');
        form.resetFields();
        setSelectedBooking(null);
        navigate("/historyrefund");
      } else {
        message.error(response?.data?.error || 'เกิดข้อผิดพลาดในการส่งคำขอคืนเงิน');
      }
    } catch (error: any) {
      console.error('Error creating refund:', error);
      message.error('เกิดข้อผิดพลาดในการส่งคำขอคืนเงิน');
    } finally {
      setSubmitLoading(false);
    }
  };

  const goToHistory = () => {
    navigate("/historyrefund");
  };

  const bookingOptions = bookings?.map(booking => ({
    value: booking.booking_code,
    label: `${booking.booking_code} - ${booking.payment?.totalprice ?? 0}฿ ${booking.can_refund ? '(คืนเงินได้)' : '(คืนเงินไม่ได้)'}`,
    disabled: !booking.can_refund
  })) ?? [];

  const bankOptions = banks?.map(bank => ({
    value: bank.id,
    label: bank.bank_name
  })) ?? [];

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      <Navbar/>
      <Row style={{ width: 1300, margin: "20px auto 0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={2}>Refund</Title>
        <Button
          type="primary"
          style={{ width: 150, height: 40, marginBottom: 20, backgroundColor: "#00306E", color: "#ffffff", fontSize: 18 }}
          onClick={goToHistory}
        >
          History
        </Button>
      </Row>

      <Spin spinning={loading}>
        <Form onFinish={handleSubmit} layout="vertical" form={form} style={{ width: 1300, margin: "0 auto" }}>
          <Card style={{ borderRadius: 10, minHeight: 600 }}>
            <Row style={{ marginLeft: 100 }}>
              <Form.Item
                name="booking_code"
                label="เลือกการจอง"
                rules={[{ required: true, message: 'กรุณาเลือกการจอง' }]}
                style={{ width: '100%', marginBottom: 30 }}
              >
                <Select
                  showSearch
                  style={{ width: 500, height: 40 }}
                  placeholder="เลือกการจองที่ต้องการขอคืนเงิน"
                  optionFilterProp="label"
                  filterSort={(a, b) => (a?.label ?? "").toLowerCase().localeCompare((b?.label ?? "").toLowerCase())}
                  options={bookingOptions}
                  onChange={handleBookingChange}
                />
              </Form.Item>

              {selectedBooking && (
                <div style={{ 
                  width: '100%', 
                  marginBottom: 20, 
                  padding: 15, 
                  backgroundColor: selectedBooking.can_refund ? '#f6ffed' : '#fff2f0',
                  border: `1px solid ${selectedBooking.can_refund ? '#b7eb8f' : '#ffccc7'}`,
                  borderRadius: 6 
                }}>
                  <p><strong>รหัสการจอง:</strong> {selectedBooking.booking_code}</p>
                  <p><strong>จำนวนเงิน:</strong> {selectedBooking.payment?.totalprice ?? 0}฿</p>
                  <p><strong>วันที่จอง:</strong> {new Date(selectedBooking.created_at).toLocaleDateString('th-TH')}</p>
                  <p><strong>สถานะการคืนเงิน:</strong> 
                    <span style={{ color: selectedBooking.can_refund ? '#52c41a' : '#ff4d4f', fontWeight: 'bold', marginLeft: 8 }}>
                      {selectedBooking.can_refund ? '✓ คืนเงินได้' : '✗ คืนเงินไม่ได้'}
                    </span>
                  </p>
                </div>
              )}

              <Row style={{ width: '100%' }}>
                <Form.Item
                  name="bank_id"
                  label="ธนาคาร"
                  rules={[{ required: true, message: 'กรุณาเลือกธนาคาร' }]}
                >
                  <Select
                    showSearch
                    style={{ width: 500, height: 40 }}
                    placeholder="เลือกธนาคาร"
                    optionFilterProp="label"
                    filterSort={(a, b) => (a?.label ?? "").toLowerCase().localeCompare((b?.label ?? "").toLowerCase())}
                    options={bankOptions}
                  />
                </Form.Item>

                <Form.Item
                  name="bank_number"
                  label="เลขที่บัญชี"
                  rules={[
                    { required: true, message: 'กรุณากรอกเลขที่บัญชี' },
                    { min: 10, message: 'เลขที่บัญชีต้องมีอย่างน้อย 10 หลัก' },
                    { max: 20, message: 'เลขที่บัญชีต้องมีไม่เกิน 20 หลัก' },
                    { pattern: /^[0-9]+$/, message: 'เลขที่บัญชีต้องเป็นตัวเลขเท่านั้น' }
                  ]}
                  style={{ marginLeft: 40 }}
                >
                  <Input style={{ width: 500, height: 40 }} placeholder="กรอกเลขที่บัญชี" maxLength={20} />
                </Form.Item>
              </Row>

              <Form.Item
                name="reason"
                label="เหตุผลในการขอคืนเงิน"
                rules={[
                  { required: true, message: 'กรุณากรอกเหตุผล' },
                  { min: 10, message: 'เหตุผลต้องมีอย่างน้อย 10 ตัวอักษร' }
                ]}
                style={{ width: '100%' }}
              >
                <TextArea showCount maxLength={500} style={{ width: 1045, height: 90 }} placeholder="กรุณาระบุเหตุผลในการขอคืนเงิน" rows={4} />
              </Form.Item>

            </Row>
          </Card>

          <div style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitLoading}
              disabled={!selectedBooking?.can_refund}
              style={{ width: 150, margin: 30, height: 40, backgroundColor: "#00306E", color: "#ffffff", fontSize: 18 }}
            >
              ส่งคำขอ
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  );
};
