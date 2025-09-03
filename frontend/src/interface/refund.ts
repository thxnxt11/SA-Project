export interface BookingInfo {
  id: number;
  booking_code: string;
  created_at: string;
  refund_type_id: number;  // << backend ยังไม่มี
  can_refund: boolean;
  payment: {               // << backend ส่งเป็น amount เฉย ๆ
    totalprice: number;
    status: string;
  };
}


export interface BankOption {
  bank_code: any;
  id: number;
  bank_name: string;
}

export interface RefundRequest {
  booking_code: string;
  reason: string;
  bank_number: string;
  bank_id: number;
}

export interface RefundHistoryItem {
  refund_id: number;
  reason: string;
  bank_number: string;
  created_at: string;
  booking_code: string;
  payment_amount: number;
  status: string;
  bank_name: string;
}