import type { StaffAssignmentInterface } from "./staff_assignment";
import type { ShowDatesInterface } from "./showdate";

export interface AssignmentInterface {
  ID?: number;
  task: string;
  description: string;
  assignment_start?: string;
  assignment_end?: string;
  // assignment_time_start?: string;
  // assignment_time_end?: string;
  assignment_status_id?: number; // foreign key ของ status
  assignment_status?: AssignmentStatusInterface; // preload object ของ status

  show_date_id?: number; // FK ต้องส่งเวลาสร้าง/อัปเดต
  show_date?: ShowDatesInterface; // preload object ของ show_date

  staff_ids?: number[]; // 👈 สำหรับส่งไป backend ตอน create/update
  staff_assignments?: StaffAssignmentInterface[]; // preload จาก backend
}

export interface AssignmentStatusInterface {
  ID?: number;
  assignment_status?: string; // เช่น "Pending", "In Progress", "Completed"
}
