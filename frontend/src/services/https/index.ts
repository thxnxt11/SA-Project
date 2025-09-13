import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import type { PromotionInterface } from "../../interface/promotion";
import type { ConcertInterface } from "../../interface/concert";
import type { ShowDatesInterface } from "../../interface/showdate";
import type { VenueInterface, VenueOptions } from "../../interface/venue";
import type { ZoneInterface } from "../../interface/zone";
import type { bookingInterface } from "../../interface/booking";
import type { ReportType } from "../../interface/report";
import type {
  Bank,
  Refund,
  RefundableBooking,
  RefundRequest,
  RefundResponse,
} from "../../interface/refund";
import type { AssignmentInterface } from "../../interface/assignment";
import type {
  CreateUserInterface,
  UpdateUserPayload,
} from "../../interface/user";
import type { EquipmentInterface } from "../../interface/equipment";

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
  validateCode: (data: { code: string; target: string; concert_id?: number }) =>
    Post(`${PUBLIC_API_URL}/promotion/validate`, data, false),
  getConcertByuserId: (user_id: number | string | undefined) =>
    Get(`${PUBLIC_API_URL}/concert/${user_id}/user`),
};

// Concert APIs
export const concertAPI = {
  getAll: () => Get(`${PUBLIC_API_URL}/concerts`, false),
  getById: (id: number) => Get(`${PUBLIC_API_URL}/concert/${id}`, false),
  create: async (data: Partial<ConcertInterface>) => {
    const r = await Post(`${PUBLIC_API_URL}/concerts`, data);
    return r?.data;
  },
  update: async (id: number | string, data: Partial<ConcertInterface>) => {
    const r = await Update(`${PUBLIC_API_URL}/concerts/${id}`, data);
    return r?.data;
  },
  delete: async (id: number | string) => {
    const r = await Delete(`${PUBLIC_API_URL}/concerts/${id}`);
    return r?.data;
  },
};

export const seatAPI = {
  getByZoneId: (id: number) => Get(`${PUBLIC_API_URL}/zone/${id}/seats`, false),
  getbyzoneid: async (id: number | string) => {
    const r = await Get(`${PUBLIC_API_URL}/seatzone/${id}`);
    return r?.data;
  },

  updatebyid: async (
    id: number | string,
    seat_id: number | string,
    data: { seatavailable_status: string }
  ) => {
    const r = await Update(
      `${PUBLIC_API_URL}/seatzone/${id}/seat/${seat_id}`,
      data
    );
    return r?.data;
  },

  deletebyid: async (id: number | string) => {
    const r = await Delete(`${PUBLIC_API_URL}/seatzone/${id}`);
    return r?.data;
  },

  addbyid: async (id: number | string) => {
    const r = await Post(`${PUBLIC_API_URL}/seatzone/${id}`, {});
    return r?.data;
  },

  creatSeat: (data: any) => Post(`${PUBLIC_API_URL}/seats/generate`,data),
};

export const ShowDateAPI = {
  getZonesByShowDateId: (id: number) =>
    Get(`${PUBLIC_API_URL}/showdate/${id}/zones`, false),
  add: async (data: Partial<ShowDatesInterface>) => {
    const r = await Post(`${PUBLIC_API_URL}/showdate`, data);
    return r?.data;
  },

  update: async (id: number | string, data: Partial<ShowDatesInterface>) => {
    const r = await Update(`${PUBLIC_API_URL}/showdate/${id}`, data);
    return r?.data;
  },
  delete: async (id: number | string) => {
    const r = await Delete(`${PUBLIC_API_URL}/showdate/${id}`);
    return r?.data;
  },
  deleteByDate: async (concert_id: number, showdate: string) => {
    const r = await Delete(
      `${PUBLIC_API_URL}/showdate/concert/${concert_id}/date/${showdate}`
    );
    return r?.data;
  },
  getAllShowdate: () => Get(`${PUBLIC_API_URL}/showdates/calendar`),
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
  getETicketByBookingId: (booking_id: number | string | undefined) =>
    Get(`${PUBLIC_API_URL}/e-tickets/booking/${booking_id}`),
};

export const uploadAPI = {
  upload: (data: FormData) => axios.post(`${PUBLIC_API_URL}/upload`, data),
  uploadReceipt: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axios.post(
      `${PUBLIC_API_URL}/upload/order-receipt`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
  uploadProductImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await axios.post(`${PUBLIC_API_URL}/upload/product`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const eticketApi = {
  getByBookingId: (booking_id: number | string | undefined) =>
    Get(`${PUBLIC_API_URL}/e-tickets/booking/${booking_id}`),
  getByUserId: (user_id: number | string | undefined) =>
    Get(`${PUBLIC_API_URL}/e-tickets/${user_id}/user`),
  getByShowId: (
    user_id: number | string | undefined,
    concert_id: number | string | undefined,
    show_date_id: number | string | undefined
  ) =>
    Get(
      `${PUBLIC_API_URL}/eticket/user/${user_id}/concert/${concert_id}/show/${show_date_id}`
    ),
};

export const userApi = {
  getById: (user_id: number | string | undefined) =>
    Get(`${PUBLIC_API_URL}/user/${user_id}`),
  updateById: (user_id: number | string | undefined, data: any) =>
    Update(`${PUBLIC_API_URL}/user/${user_id}`, data),
  getAllGender: () => Get(`${PUBLIC_API_URL}/genders`),
};

export async function venueoption(): Promise<VenueOptions[]> {
  const res = await axios.get(`${PUBLIC_API_URL}/venues/option`);
  return res.data;
}

export const zoneApi = {
  getconbyuser: async (user_id: number | string) => {
    const r = await Get(`${PUBLIC_API_URL}/zoneconcert/${user_id}`);
    return r?.data;
  },

  getshowbycon: async (id: number | string) => {
    const r = await Get(`${PUBLIC_API_URL}/zoneshowdate/${id}`);
    return r?.data;
  },

  getzonebyshow: async (id: number | string) => {
    const r = await Get(`${PUBLIC_API_URL}/zone/${id}`);
    return r?.data;
  },

  add: async (data: Partial<ZoneInterface>) => {
    const r = await Post(`${PUBLIC_API_URL}/zone`, data);
    return r?.data; // created Zone
  },

  update: async (id: number | string, data: Partial<ZoneInterface>) => {
    const r = await Update(`${PUBLIC_API_URL}/zone/${id}`, data);
    return r?.data;
  },

  delete: async (id: number | string) => {
    const r = await Delete(`${PUBLIC_API_URL}/zone/${id}`);
    return r?.data;
  },

  getzonetype: async () => {
    const r = await Get(`${PUBLIC_API_URL}/zonetype`);
    return r?.data;
  },
};

// Reports APIs
export const reportAPI = {
  // ดึงประเภทรายงานทั้งหมด
  getTypes: async (): Promise<ReportType[]> => {
    const res = await Get(`${PUBLIC_API_URL}/report-types`, false);
    return res?.data as ReportType[];
  },

  // สร้างรายงานใหม่ (multipart/form-data)
  create: async (
    user_id: number | string | undefined,
    formData: FormData
  ): Promise<any> => {
    // ใช้ axios ตรง ๆ แบบ uploadAPI เพื่อส่ง multipart ได้ถูกต้อง
    const res = await axios.post(
      `${PUBLIC_API_URL}/users/${user_id}/reports`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );
    return res.data;
  },

  // ประวัติการส่งรายงานของผู้ใช้
  getHistory: async (user_id: number): Promise<Report[]> => {
    const res = await Get(`${PUBLIC_API_URL}/reports/history/${user_id}`);
    return res?.data as Report[];
  },
  replyReport: async (
    report_id: number,
    message: string,
    user_id: number,
    role_id: number
  ): Promise<any> => {
    const res = await Post(`${PUBLIC_API_URL}/reports/${report_id}/reply`, {
      message,
      user_id,
      role_id,
    });
    return res?.data;
  },
};

// Refund APIs
export const refundAPI = {
  // ดึงรายการ booking ที่สามารถ refund ได้
  getRefundableBookings: async (
    userId: number
  ): Promise<{ refundable_bookings: RefundableBooking[]; count: number }> => {
    const res = await Get(
      `${PUBLIC_API_URL}/users/${userId}/refundable-bookings`
    );
    return res?.data as {
      refundable_bookings: RefundableBooking[];
      count: number;
    };
  },

  // ดึงรายการธนาคารทั้งหมด (คืนเป็น Bank[])
  getBanks: async (): Promise<Bank[]> => {
    const res = await Get(`${PUBLIC_API_URL}/banks`, false);
    // ตามสัญญาเดิมคืนเฉพาะ array
    return (res?.data?.banks ?? []) as Bank[];
  },

  // สร้างคำขอ refund
  createRefund: async (
    userId: number,
    data: RefundRequest
  ): Promise<RefundResponse> => {
    const res = await Post(`${PUBLIC_API_URL}/users/${userId}/refunds`, data);
    return res?.data as RefundResponse;
  },

  // ประวัติการ Refund ของผู้ใช้
  getHistory: async (user_id: number): Promise<Refund[]> => {
    const res: any = await Get(`${PUBLIC_API_URL}/refunds/history/${user_id}`);
    return (res?.data ?? []) as Refund[];
  },

  // ลบคำขอ Refund
  delete: async (refund_id: number): Promise<any> => {
    const res = await Delete(`${PUBLIC_API_URL}/refunds/${refund_id}`);
    return res?.data;
  },
  updateStatus: async (
    refund_id: number,
    refund_status_id: number,
    requester_id: number
  ): Promise<any> => {
    const res = await Update(`${PUBLIC_API_URL}/refunds/${refund_id}/status`, {
      refund_status_id,
      requester_id,
    });
    return res?.data;
  },
};

export const staffAssignmentAPI = {
  // ดึงงานของตัวเอง
  getMyAssignments: (id: number | string | undefined) =>
    Get(`${PUBLIC_API_URL}/staff/${id}/assignments`),

  // รับงาน (เปลี่ยนสถานะเป็น In Progress)
  acceptAssignment: (
    assignmentId: number,
    user_id: number | string | undefined
  ) =>
    Post(
      `${PUBLIC_API_URL}/staff/${user_id}/assignments/${assignmentId}/accept`,
      {}
    ),

  // อัปเดตสถานะงานของตัวเอง
  updateStatus: (staffAssignmentId: number, statusId: number) =>
    Update(
      `${PUBLIC_API_URL}/staff/staff_assignments/${staffAssignmentId}/status`,
      {
        assignment_status_id: statusId,
      }
    ),
  InjectAssignment: (
    assignmentId: number,
    user_id: number | string | undefined
  ) =>
    Post(
      `${PUBLIC_API_URL}/staff/${user_id}/assignments/${assignmentId}/inject`,
      {}
    ),
  CompleteAssignment: (
    assignmentId: number,
    user_id: number | string | undefined
  ) =>
    Post(
      `${PUBLIC_API_URL}/staff/${user_id}/assignments/${assignmentId}/complete`,
      {}
    ),
};

// Fetch categories
export const categoriesAPI = {
  getAllCategories: () => Get(`${PUBLIC_API_URL}/categories`, false),
};

export const colorsAPI = {
  getAllColors: () => Get(`${PUBLIC_API_URL}/colors`, false),
};

export const sizesAPI = {
  getAllSizes: () => Get(`${PUBLIC_API_URL}/sizes`, false),
};

export const actionAPI = {
  getAllSizes: () => Get(`${PUBLIC_API_URL}/action`, false),
};

export const productsAPI = {
  createProduct: (payload: any) => Post(`${PUBLIC_API_URL}/products`, payload),
  getAllProducts: () => Get(`${PUBLIC_API_URL}/products`, false),
  getByProductID: (ID: number) =>
    Get(`${PUBLIC_API_URL}/products/${ID}`, false),
  update: (id: number, payload: any) => {
    return axios.put(`${PUBLIC_API_URL}/products/${id}`, payload);
  },
  deleteByID: (id: number) => Delete(`${PUBLIC_API_URL}/products/${id}`, false),
};

export const variantAPI = {
  deleteByID: (id: number) => Delete(`${PUBLIC_API_URL}/variant/${id}`),
};

export const movementsAPI = {
  getAllProducts: () => Get(`${PUBLIC_API_URL}/stockmovements`, false),
  create: (data: any) => axios.post("/stock-movements", data),
};

export const cartAPI = {
  addToCart: (payload: {
    user_id: number;
    variant_id: number;
    quantity: number;
  }) => {
    return axios.post(`${PUBLIC_API_URL}/cart/add`, payload);
  },
  getCartByUserID: (user_id: number) => {
    return axios.get(`${PUBLIC_API_URL}/cart/${user_id}`);
  },
  updateCartItem: (item_id: number, quantity: number) => {
    return axios.put(`${PUBLIC_API_URL}/cart/item/${item_id}`, { quantity });
  },
  removeCartItem: (item_id: number) => {
    return axios.delete(`${PUBLIC_API_URL}/cart/item/${item_id}`);
  },
  updateCartItemSelected: (id: number, selected: boolean) => {
    return axios.patch(`${PUBLIC_API_URL}/cart/items/${id}/select`, {
      selected,
    });
  },
};

export const paymentOrderAPI = {
  createPaymentOrder: (data: any) =>
    axios.post(`${PUBLIC_API_URL}/payment-orders/create`, data),
  getAllPaymentMethods: () =>
    axios.get(`${PUBLIC_API_URL}/payment-orders/methods`),
  getPaymentOrderById: (id: number) =>
    axios.get(`${PUBLIC_API_URL}/payment-orders/${id}`),

  updatePaymentOrder: (id: number, data: any) =>
    axios.put(`${PUBLIC_API_URL}/payment-orders/${id}`, data),
  expirePaymentOrder: (id: number) =>
    axios.put(`${PUBLIC_API_URL}/payment-orders/${id}/expire`),
};

export const payApi = {
  getallpayment: async () => {
    const r = await Get(`${PUBLIC_API_URL}/dashboard`);
    return r?.data;
  },
};

export const userAPI = {
  getAllStaff: (query: string = "") => Get(`${PUBLIC_API_URL}/users${query}`),
  getStaffById: (id: number | string) =>
    Get(`${PUBLIC_API_URL}/users/${id}/staff`),
  createUser: (payload: CreateUserInterface) =>
    Post(`${PUBLIC_API_URL}/users`, payload),
  updateUser: (id: number | string, payload: UpdateUserPayload) =>
    Update(`${PUBLIC_API_URL}/users/${id}/staff`, payload),
  deleteUser: (id: number | string) =>
    Delete(`${PUBLIC_API_URL}/users/${id}/staff`),

  // Get dropdown data for creating/updating user
  getDropdowns: (): Promise<{
    genders: { ID: number; gender: string }[];
    roles: { ID: number; role: string }[];
    departments: { ID: number; department: string }[];
    positions: { ID: number; position: string }[];
  }> =>
    Promise.all([
      Get(`${PUBLIC_API_URL}/genders`),
      Get(`${PUBLIC_API_URL}/roles`),
      Get(`${PUBLIC_API_URL}/departments`),
      Get(`${PUBLIC_API_URL}/positions`),
    ]).then(([gendersRes, rolesRes, departmentsRes, positionsRes]) => ({
      genders: gendersRes.data,
      roles: rolesRes.data.filter((r: any) => r.ID === 3 || r.ID === 4),
      departments: departmentsRes.data,
      positions: positionsRes.data,
    })),
};

export const assignmentAPI = {
  // Assignment
  getAll: () => Get(`${PUBLIC_API_URL}/assignments`),
  getById: (id: number) => Get(`${PUBLIC_API_URL}/assignments/${id}`),
  create: (payload: AssignmentInterface) =>
    Post(`${PUBLIC_API_URL}/assignments`, {
      ...payload,
    }),
  update: (id: number | undefined, payload: AssignmentInterface) =>
    Update(`${PUBLIC_API_URL}/assignments/${id}`, {
      ...payload,
    }),
  delete: (id: number) => Delete(`${PUBLIC_API_URL}/assignments/${id}`),

  // dropdown / relation data
  getStatuses: () => Get(`${PUBLIC_API_URL}/assignment_statuses`),
  getAllStaff: () => Get(`${PUBLIC_API_URL}/users`),
  getShowDates: () => Get(`${PUBLIC_API_URL}/showdates`),
  getConcerts: () => Get(`${PUBLIC_API_URL}/concerts`),
};

// ---------- Venue + Stage API ----------
export const venueAPI = {
  // Venue
  getAll: () => Get(`${PUBLIC_API_URL}/venues`),
  getById: (id: number | string) => Get(`${PUBLIC_API_URL}/venues/${id}`),
  getVenueTypes: () => Get(`${PUBLIC_API_URL}/venuetypes`),
  create: (payload: VenueInterface) =>
    Post(`${PUBLIC_API_URL}/venues`, payload),
  update: (id: number , payload: any) =>
    Update(`${PUBLIC_API_URL}/venues/${id}`, payload),
  delete: (id: number | string) => Delete(`${PUBLIC_API_URL}/venues/${id}`), // ลบ Venue + Stages ทั้งหมด
  deletestage: (id: number) => Delete(`${PUBLIC_API_URL}/stage/${id}`), // ลบ stage พร้อม คืน equipment

  // Stage (แยกสำหรับแก้ไข Stage เดี่ยว)
  deleteStage: (id: number) => Delete(`${PUBLIC_API_URL}/stages/${id}`), // ลบ Stage เดี่ยว

  deleteStageEquipment: (id: number) =>
    Delete(`${PUBLIC_API_URL}/stages_equipments/${id}`, false), // delte equipment

  getStageTypes: () => Get(`${PUBLIC_API_URL}/stagetypes`),
};

export const equipmentAPI = {
  // ----- CRUD อุปกรณ์ -----
  getAllEquipments: () => Get(`${PUBLIC_API_URL}/equipments`),
  getEquipmentTypes: () => Get(`${PUBLIC_API_URL}/equipmenttypes`),
  getById: (id: number | string) => Get(`${PUBLIC_API_URL}/equipments/${id}`),
  create: (payload: EquipmentInterface) =>
    Post(`${PUBLIC_API_URL}/equipments`, payload),
  update: (id: number | string, payload: EquipmentInterface) =>
    Update(`${PUBLIC_API_URL}/equipments/${id}`, payload),
  delete: (id: number | string) => Delete(`${PUBLIC_API_URL}/equipments/${id}`),

  // ----- Stock / Stage Assignment -----
  assignToStage: (
    id: number | string,
    payload: { stage_id: number; quantity: number }
  ) => Post(`${PUBLIC_API_URL}/equipments/${id}/assign`, payload),

  // ----- อุปกรณ์ที่ยังใช้งานได้ / available -----
  getAvailableByStage: (stage_id: number | string) =>
    Get(`${PUBLIC_API_URL}/equipments/available?stage_id=${stage_id}`),
};
