/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/index.ts
import axios from "axios";
import type {
  AssignmentInterface,
  UpdateUserPayload,
  CreateUserInterface,
  VenueInterface,
} from "../../interfaces";

// import type { StageInterface } from "../../interfaces/stage";
import type { EquipmentInterface } from "../../interfaces/equipment";

// ---------- Base URLs ----------
const ADMIN_API_URL = "http://localhost:8000/api";

// ---------- Cookie & Config ----------
const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((row) => row.startsWith(`${name}=`));
  if (cookie) {
    let AccessToken = decodeURIComponent(cookie.split("=")[1]);
    AccessToken = AccessToken.replace(/\\/g, "").replace(/"/g, "");
    return AccessToken || null;
  }
  return null;
};

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${getCookie("0195f494-feaa-734a-92a6-05739101ede9")}`,
    "Content-Type": "application/json",
  },
});

const getConfigWithoutAuth = () => ({
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------- Axios Helpers ----------
export const Post = async (url: string, data: any, requireAuth: boolean = true) => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  try { return await axios.post(url, data, config); }
  catch (error: any) {
    if (error?.response?.status === 401) { localStorage.clear(); window.location.reload(); }
    return error.response;
  }
};

export const Get = async (url: string, requireAuth: boolean = true) => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  try { return await axios.get(url, config); }
  catch (error: any) {
    if (error?.response?.status === 401) { localStorage.clear(); window.location.reload(); }
    return error.response;
  }
};

export const PUT = async (url: string, data: any, requireAuth: boolean = true) => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  try { return await axios.put(url, data, config); }
  catch (error: any) {
    if (error?.response?.status === 401) { localStorage.clear(); window.location.reload(); }
    return error.response;
  }
};

export const Delete = async (url: string, requireAuth: boolean = true) => {
  const config = requireAuth ? getConfig() : getConfigWithoutAuth();
  try { return await axios.delete(url, config); }
  catch (error: any) {
    if (error?.response?.status === 401) { localStorage.clear(); window.location.reload(); }
    return error.response;
  }
};

// ---------- User / Staff API ----------
export const userAPI = {
  getAllStaff: (query: string = "") =>Get(`${ADMIN_API_URL}/users${query}`),
  getStaffById: (id: number | string) => Get(`${ADMIN_API_URL}/users/${id}`),
  createUser: (payload: CreateUserInterface) => Post(`${ADMIN_API_URL}/users`, payload),
  updateUser: (id: number | string, payload: UpdateUserPayload) => PUT(`${ADMIN_API_URL}/users/${id}`, payload),
  deleteUser: (id: number | string)=> Delete(`${ADMIN_API_URL}/users/${id}`),

  // Get dropdown data for creating/updating user
  getDropdowns: (): Promise<{
    genders: { ID: number; gender: string }[];
    roles: { ID: number; role: string }[];
    departments: { ID: number; department: string }[];
    positions: { ID: number; position: string }[];
  }> => Promise.all([
      Get(`${ADMIN_API_URL}/genders`),
      Get(`${ADMIN_API_URL}/roles`),
      Get(`${ADMIN_API_URL}/departments`),
      Get(`${ADMIN_API_URL}/positions`)
    ]).then(([gendersRes, rolesRes, departmentsRes, positionsRes]) => ({
      genders: gendersRes.data,
      roles: rolesRes.data.filter((r: any) => r.ID === 3 || r.ID === 4),
      departments: departmentsRes.data,
      positions: positionsRes.data,
    })),
};

export const assignmentAPI = {
  // Assignment
  getAll: () => Get(`${ADMIN_API_URL}/assignments`),
  getById: (id: number) => Get(`${ADMIN_API_URL}/assignments/${id}`),
  create: (payload: AssignmentInterface) =>
    Post(`${ADMIN_API_URL}/assignments`, {
      ...payload
    }),
  update: (id: number| undefined, payload: AssignmentInterface) =>
    PUT(`${ADMIN_API_URL}/assignments/${id}`, {
      ...payload,
    }),
  delete: (id: number) => Delete(`${ADMIN_API_URL}/assignments/${id}`),

  // dropdown / relation data
  getStatuses: () => Get(`${ADMIN_API_URL}/assignment_statuses`),
  getAllStaff: () => Get(`${ADMIN_API_URL}/users`),
  getShowDates: () => Get(`${ADMIN_API_URL}/showdates`),
  getConcerts: () => Get(`${ADMIN_API_URL}/concerts`),
};

export const staffAssignmentAPI = {
  // ดึงงานของตัวเอง
  getMyAssignments: (id: number | string |undefined) => Get(`${ADMIN_API_URL}/staff/${id}/assignments`),

  // รับงาน (เปลี่ยนสถานะเป็น In Progress)
  acceptAssignment: (assignmentId: number) =>
    Post(`${ADMIN_API_URL}/staff/assignments/${assignmentId}/accept`, {}),

  // อัปเดตสถานะงานของตัวเอง
  updateStatus: (staffAssignmentId: number, statusId: number) =>
    PUT(
      `${ADMIN_API_URL}/staff/staff_assignments/${staffAssignmentId}/status`,
      {
        assignment_status_id: statusId,
      }
    ),
};

// ---------- Venue + Stage API ----------
export const venueAPI = {
  // Venue
  getAll: () => Get(`${ADMIN_API_URL}/venues`),
  getById: (id: number | string) => Get(`${ADMIN_API_URL}/venues/${id}`),
  getVenueTypes: () => Get(`${ADMIN_API_URL}/venuetypes`),
  create: (payload: VenueInterface) => Post(`${ADMIN_API_URL}/venues`, payload),
  update: (id: number | string, payload: VenueInterface) => PUT(`${ADMIN_API_URL}/venues/${id}`, payload),
  delete: (id: number | string) => Delete(`${ADMIN_API_URL}/venues/${id}`), // ลบ Venue + Stages ทั้งหมด
  deletestage:(id : number)=>Delete(`${ADMIN_API_URL}/stage/${id}`), // ลบ stage พร้อม คืน equipment

  // Stage (แยกสำหรับแก้ไข Stage เดี่ยว)
  deleteStage: (id: number ) => Delete(`${ADMIN_API_URL}/stages/${id}`), // ลบ Stage เดี่ยว
 
  deleteStageEquipment: (id: number) => Delete(`/stages_equipments/${id}`,false), // delte equipment

  getStageTypes: () => Get(`${ADMIN_API_URL}/stagetypes`),
};


export const equipmentAPI = {
  // ----- CRUD อุปกรณ์ -----
  getAllEquipments: () => Get(`${ADMIN_API_URL}/equipments`),
  getEquipmentTypes: () => Get(`${ADMIN_API_URL}/equipmenttypes`),
  getById: (id: number | string) => Get(`${ADMIN_API_URL}/equipments/${id}`),
  create: (payload: EquipmentInterface) => Post(`${ADMIN_API_URL}/equipments`, payload),
  update: (id: number | string, payload: EquipmentInterface) =>
    PUT(`${ADMIN_API_URL}/equipments/${id}`, payload),
  delete: (id: number | string) => Delete(`${ADMIN_API_URL}/equipments/${id}`),

  // ----- Stock / Stage Assignment -----
  assignToStage: (id: number | string, payload: { stage_id: number; quantity: number }) =>
    Post(`${ADMIN_API_URL}/equipments/${id}/assign`, payload),

  // ----- อุปกรณ์ที่ยังใช้งานได้ / available -----
  getAvailableByStage: (stage_id: number | string) =>
    Get(`${ADMIN_API_URL}/equipments/available?stage_id=${stage_id}`),
};



