


// // api/refund.ts
// export interface Bank {
//   ID: number;
//   bank_name: string;
//   CreatedAt: string;
//   UpdatedAt: string;
// }

// export interface RefundHistoryItem {
//   id: number;
//   memberid: string;
//   bookingid: string;
//   amount: number;
//   status: string;
//   date: string;
//   reason: string;
//   bank_number: string;
//   firstname: string;
//   lastname: string;
//   consume: string;
// }

// export interface CreateRefundData {
//   reason: string;
//   bank_number: string;
//   consume: string; // ISO date string
//   firstname: string;
//   lastname: string;
//   booking_id: number;
//   bank_id: number;
// }

// export interface RefundHistoryResponse {
//   refunds: RefundHistoryItem[];
//   total: number;
// }

// // ดึงรายการธนาคารทั้งหมด
// export const getBanks = async (): Promise<Bank[]> => {
//   try {
//     const response = await axios.get(`${API_URL}/banks`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching banks:', error);
//     throw error;
//   }
// };

// // สร้างคำขอเงินคืนใหม่
// export const createRefund = async (data: CreateRefundData): Promise<any> => {
//   try {
//     const response = await axios.post(`${API_URL}/refunds`, data);
//     return response.data;
//   } catch (error) {
//     console.error('Error creating refund:', error);
//     throw error;
//   }
// };

// // ดึงประวัติคำขอเงินคืนของผู้ใช้
// export const getUserRefunds = async (): Promise<RefundHistoryResponse> => {
//   try {
//     const response = await axios.get(`${API_URL}/refunds`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching user refunds:', error);
//     throw error;
//   }
// };

// // ดึงคำขอเงินคืนตาม ID
// export const getRefundById = async (id: number): Promise<RefundHistoryItem> => {
//   try {
//     const response = await axios.get(`${API_URL}/refunds/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching refund by ID:', error);
//     throw error;
//   }
// };