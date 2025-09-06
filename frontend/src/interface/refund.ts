export interface Payment {
  totalprice: number;
  status: string;
}

export interface BookingInfo {
  id: number;
  booking_code: string;
  created_at: string; // หรือ Date
  refund_type_id: number;
  can_refund: boolean;
  payment: Payment;
}

export interface RefundableBooking {
  booking_code: string;
  booking_id: number;
}

export interface Bank {
  id: number;
  bank_name: string;
  bank_code: string;
}

export interface RefundRequest {
  booking_code: string;
  reason?: string;
  bank_number?: string;
  bank_id: number;
}

export interface RefundResponse {
  message: string;
  refund_id: number;
}

export interface Refund {
  id: number;
  bookingid: string;
  amount: number;
  status: string;
  date: string; // หรือ Date
  created_at: string;
  updated_at: string;
  firstname?: string;   
  lastname?: string;
  booking_code?: string;
}


export interface RefundHistoryResponse {
  refunds: Refund[];
  total: number;
}