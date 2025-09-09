import type { UserInterface } from "./user";

export interface StaffAssignmentInterface {
  ID?: number;
  user_id?: number; // FK ของ user
  assignment_id?: number;
  show_date_id?: number;
  assignment_status_id?: number; // FK ของ status
  assignment_status?: AssignmentStatusInterface; // preload object ของ status
  user?: UserInterface; // preload object ของ user
}

export interface AssignmentStatusInterface{
    ID?: number;
    Status?: string;
}
