import type { StaffAssignmentInterface } from "./staff_assignment";
import type { AssignmentStatusInterface } from "./assignment__status";
import type { ShowDateInterface } from "./showdate";

export interface AssignmentInterface {
  ID?: number;
  task: string;
  description: string;
  assignment_date_start?: string;
  assignment_date_end?: string;
  assignment_time_start?: string;
  assignment_time_end?: string;
  assignment_status_id?: number; // foreign key ของ status
  assignment_status?: AssignmentStatusInterface; // preload object ของ status

  show_date_id?: number; // FK ต้องส่งเวลาสร้าง/อัปเดต
  show_date?: ShowDateInterface; // preload object ของ show_date

  staff_ids?: number[]; // 👈 สำหรับส่งไป backend ตอน create/update
  staff_assignments?: StaffAssignmentInterface[]; // preload จาก backend
}
