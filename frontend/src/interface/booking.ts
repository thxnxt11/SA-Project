export interface bookingInterface {
  ID?: number; // Booking.ID
  user_id: number;
  showdate_id: number;
  zone_id: number;
  queue_number: number; // โซนยืนจะถูกคำนวณใน backend
  total_price: number;
  booking_status_id: number; // 1=pending, 2=paid, 3=expired (ตามระบบคุณ)
  booking_date: string; // ISO datetime
  expired_date: string;
  seat_ids?: number[]; // รายการ SeatAvailable.ID ที่จอง (ถ้ามี)
}