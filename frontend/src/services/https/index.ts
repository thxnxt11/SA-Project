import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type { PromotionInterface } from "../../interface/promotion";
import type { bookingInterface } from "../../interface/booking";
import type { Report, ReportType } from "../../interface/report";
import type { RefundRequest, RefundResponse, RefundableBooking, Bank, Refund } from "../../interface/refund";

const ORGANIZER_API_URL = "http://localhost:8000/organizer";
const PUBLIC_API_URL = "http://localhost:8000/api";

const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(`${name}=`));

  if (cookie) {
    let AccessToken = decodeURIComponent(cookie.split("=")[1]);
    AccessToken = AccessToken.replace(/\\/g, "").replace(/"/g, "");
    return AccessToken ? AccessToken : null;
  }
  return null;
};

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${getCookie(
      "0195f494-feaa-734a-92a6-05739101ede9"
    )}`,
    "Content-Type": "application/json",
  },
});

const getConfigWithoutAuth = () => ({
  headers: {
    "Content-Type": "application/json",
  },
});

export const Post = async (
  url: string,
  data: any,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  // const config = getConfigWithoutAuth();
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .post(url, data, config)
    .then((res) => res)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Get = async (
  url: string,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  // const config = getConfigWithoutAuth();
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .get(url, config)
    .then((res) => res)
    .catch((error: AxiosError) => {
      if (error?.message === "Network Error") {
        return error.response;
      }
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Update = async (
  url: string,
  data: any,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  // const config = getConfigWithoutAuth();
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .put(url, data, config)
    .then((res) => res)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

export const Delete = async (
  url: string,
  requireAuth: boolean = true
): Promise<AxiosResponse | any> => {
  // const config = getConfigWithoutAuth();
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  return await axios
    .delete(url, config)
    .then((res) => res)
    .catch((error: AxiosError) => {
      if (error?.response?.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      return error.response;
    });
};

// Promotion APIs
export const promotionAPI = {
  create: (data: PromotionInterface) =>
    Post(`${ORGANIZER_API_URL}/promotion/add`, data),
  getAll: () => Get(`${ORGANIZER_API_URL}/promotion`),
  getById: (id: number) => Get(`${ORGANIZER_API_URL}/promotion/${id}`),
  update: (id: number, data: PromotionInterface) =>
    Update(`${ORGANIZER_API_URL}/promotion/${id}`, data),
  delete: (id: number) => Delete(`${ORGANIZER_API_URL}/promotion/${id}`),
  getAllTypes: () => Get(`${PUBLIC_API_URL}/promotions`, false),
  validateCode: (data: {code: string; target: string; concert_id?: number }) =>
    Post(`${PUBLIC_API_URL}/promotion/validate`, data, false),
};

// Concert APIs
export const concertAPI = {
  getAll: () => Get(`${PUBLIC_API_URL}/concerts`, false),
  getById: (id: number) => Get(`${PUBLIC_API_URL}/concert/${id}`, false),
};

export const seatAPI = {
  getByZoneId: (id: number) => Get(`${PUBLIC_API_URL}/zone/${id}/seats`),
};

export const ShowDateAPI = {
  getZonesByShowDateId: (id: number) =>
    Get(`${PUBLIC_API_URL}/showdate/${id}/zones`, false),
};

export const bookingAPI = {
  create: (data: bookingInterface) => Post(`${PUBLIC_API_URL}/booking`, data),
};

export const paymentAPI = {
  create: (data: any) => Post(`${PUBLIC_API_URL}/payment`, data),
  getAllRefundTypes: () => Get(`${PUBLIC_API_URL}/refundtypes`),
  getAllPaymentMethods: () => Get(`${PUBLIC_API_URL}/paymentmethods`),
  updateReceipt: (id: number, data: { receipt_url: string }) =>
    Update(`${PUBLIC_API_URL}/payment/${id}/receipt`, data),
};

export const uploadAPI = {
  upload: (data: FormData) =>
    axios.post(`${PUBLIC_API_URL}/upload`, data)
}

// ดึงประเภทรายงานทั้งหมด
export const getReportTypes = async (): Promise<ReportType[]> => {
  try {
    const response = await axios.get(`${PUBLIC_API_URL}/report-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching report types:', error);
    throw error;
  }
};

// สร้างรายงานใหม่
export const createReport = async (user_id: number | string | undefined, formData: FormData): Promise<any> => {
  try {
    const response = await axios.post(`${PUBLIC_API_URL}/reports/${user_id}/user`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

export const getReportHistory = async (user_id: number): Promise<Report[]> => {
  try {
    const response = await axios.get(`${PUBLIC_API_URL}/reports/history/${user_id}`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching report history:', error);
    throw error;
  }
};

export const refundAPI = {
  // ดึงรายการ booking ที่สามารถ refund ได้
  getRefundableBookings: async (userId: number): Promise<{ refundable_bookings: RefundableBooking[]; count: number }> => {
    const res = await axios.get(`${PUBLIC_API_URL}/users/${userId}/refundable-bookings`);
    return res.data;
  },

  // ดึงรายการธนาคารทั้งหมด
  getBanks: async (): Promise<Bank[]> => {
    const res = await axios.get(`${PUBLIC_API_URL}/banks`);
    return res.data.banks;
  },

  // สร้างคำขอ refund
  createRefund: async (userId: number, data: RefundRequest): Promise<RefundResponse> => {
    const res = await axios.post(`${PUBLIC_API_URL}/users/${userId}/refunds`, data);
    return res.data;
  },
};

export const getRefundHistory = async (user_id: number): Promise<Refund[]> => {
  try {
    const response = await axios.get(`${PUBLIC_API_URL}/refunds/history/${user_id}`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching refund history:', error);
    throw error;
  }
};
export const deleteRefund = async (refund_id: number) => {
  const res = await axios.delete(`${PUBLIC_API_URL}/refunds/${refund_id}`);
  return res.data;
};