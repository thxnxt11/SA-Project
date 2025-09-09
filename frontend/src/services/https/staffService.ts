// import axios from "axios";

// const API_STAFF = "http://localhost:8000/api";

// export interface StaffPayload {
//   firstName: string;
//   lastName: string;
//   birthday: string;
//   address: string;
//   gender_id: number;
//   email: string;
//   phone_number?: string;
//   role_id: number;
//   department_id: number;
//   position_id: number;
// }

// export interface Staff {
//   ID: number;
//   first_name: string;
//   last_name: string;
//   birthday: string;
//   address: string;
//   email: string;
//   phone_number?: string;
//   gender_id: number;
//   role_id: number;
//   department_id: number;
//   position_id: number;
//   gender?: { ID: number; gender: string };
//   role?: { ID: number; role: string };
//   department?: { ID: number; department: string };
//   position?: { ID: number; position: string };
// }

// export interface Gender {
//   ID: number;
//   gender: string;
// }

// export interface Role {
//   ID: number;
//   role: string;
// }

// export interface Department {
//   ID: number;
//   department: string;
// }

// export interface Position {
//   ID: number;
//   position: string;
// }

// interface Dropdowns {
//   genders: Gender[];
//   roles: Role[];
//   departments: Department[];
//   positions: Position[];
// }

// export const staffService = {
//   async getDropdowns(): Promise<Dropdowns> {
//     const [gendersRes, rolesRes, departmentsRes, positionsRes] = await Promise.all([
//       axios.get<Gender[]>(`${API_STAFF}/genders`),
//       axios.get<Role[]>(`${API_STAFF}/roles`),
//       axios.get<Department[]>(`${API_STAFF}/departments`),
//       axios.get<Position[]>(`${API_STAFF}/positions`),
//     ]);

//     // ✅ filter เฉพาะ role ID = 3 (admin) และ 4 (staff)
//   const allowedRoles = rolesRes.data.filter(r => r.ID === 3 || r.ID === 4);
//     return {
//       genders: gendersRes.data,
//       roles: allowedRoles,
//       departments: departmentsRes.data,
//       positions: positionsRes.data,
//     };
//   },

//   async createStaff(payload: StaffPayload) {
//     return axios.post(`${API_STAFF}/users`, payload);
//   },

//   // เพิ่มฟังก์ชัน updateUser
//   async updateUser(id: string, payload: StaffPayload) {
//     return axios.put(`${API_STAFF}/users/${id}`, payload);
//   },

//   // ฟังก์ชัน getUser สำหรับดึงข้อมูลพนักงานตาม id
//   async getUser(id: string) {
//     return axios.get(`${API_STAFF}/users/${id}`);
//   },
// };
