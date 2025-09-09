// import axios from "axios";

// // ---------- Interfaces ----------
// export interface AssignmentStatus {
//   ID: number;
//   assignment_status: string;
// }
// export interface Staff {
//   ID: number;
//   first_name: string;
//   last_name: string;
//   department: string;
//   position: string;
// }


// export interface ShowDateOption {
//   concert_id?: number;
//   show_date_id: number;
//   show_date: string;
//   concert_name: string;
//   venue_name: string;
// }
// export interface ConcertOption {
//   ID: number;
//   concert: string;
// }

// export interface Assignment {
//   ID: number;
//   task: string;
//   description: string;
//   show_date: ShowDateOption | null;
//   staffs: Staff[];
//   assignment_datestart: string; // YYYY-MM-DD
//   assignment_dateend: string;   // YYYY-MM-DD
//   assignment_timestart: string; // HH:mm
//   assignment_timeend: string;   // HH:mm
//   assignment_status_id: number;
//    show_date_id: number;
// }

// // ---------- สำหรับ Frontend Table ----------

// export interface AssignmentView {
//   ID: number;
//   task: string;
//   description: string;
//   assignedStaffNames: string[];
//   startDate: string;
//   endDate: string;
//   startTime: string;
//   endTime: string;
//   category: string;
//   showDateId: number;
//   showDateName: string;
//   concertName: string;
//   assignment_status_id: number;
// }

// export interface AssignmentPayload {
//   task: string;
//   description: string;
//   show_date_id: number;
//   staff_ids: number[];
//   assignment_status_id?: number; // default 1 = Pending
//   assignment_datestart: string; // YYYY-MM-DD
//   assignment_dateend: string;   // YYYY-MM-DD
//   assignment_timestart: string; // HH:mm
//   assignment_timeend: string;   // HH:mm
// }

// // ---------- Axios Service ----------

// const API_ASSIGN = "http://localhost:8000/api";

// export const taskService = {
//   getAssignments: async (): Promise<Assignment[]> => {
//     const res = await axios.get<Assignment[]>(`${API_ASSIGN}/assignments`);
//     return res.data;
//   },

//   getAssignment: async (id: number): Promise<Assignment> => {
//     const res = await axios.get<Assignment>(`${API_ASSIGN}/assignments/${id}`);
//     return res.data;
//   },

//   getShowDates: async (): Promise<ShowDateOption[]> => {
//     const res = await axios.get<ShowDateOption[]>(`${API_ASSIGN}/showdates`);
//     return res.data;
//   },

//   getAssignmentStatuses: async (): Promise<AssignmentStatus[]> => {
//     const res = await axios.get<AssignmentStatus[]>(`${API_ASSIGN}/assignment_statuses`);
//     return res.data;
//   },

//   createAssignment: async (payload: AssignmentPayload): Promise<Assignment> => {
//     const res = await axios.post<Assignment>(`${API_ASSIGN}/assignments`, {
//       ...payload,
//       assignment_status_id: payload.assignment_status_id || 1,
//     });
//     return res.data;
//   },

//   updateAssignment: async (id: number, payload: AssignmentPayload): Promise<Assignment> => {
//     const res = await axios.put<Assignment>(`${API_ASSIGN}/assignments/${id}`, {
//       ...payload,
//       assignment_status_id: payload.assignment_status_id || 1,
//     });
//     return res.data;
//   },

//   deleteAssignment: async (id: number): Promise<{ message: string }> => {
//     const res = await axios.delete<{ message: string }>(`${API_ASSIGN}/assignments/${id}`);
//     return res.data;
//   },
//    getStaff: async (): Promise<{ data: Staff[] }> => {
//     const res = await axios.get<Staff[]>(`${API_ASSIGN}/users`);
//     return { data: res.data }; // คืน object { data: Staff[] } ให้ตรงกับ frontend
//   // }
// };
