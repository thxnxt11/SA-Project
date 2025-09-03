
export interface ReportType {
  ID: number;
  type_name: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ReportHistoryItem {
  id: number;
  topic: string;
  type: string;
  status: string;
  date: string;
  description?: string;
  photo?: string;
  created_at: string;
  updated_at: string;
  firstname?: string;   // 👈 เพิ่ม
  lastname?: string;    // 👈 เพิ่ม
}

export interface CreateReportData {
  topic: string;
  description: string;
  report_type_id: number;
  members_id?: number;
  photo?: File;
}

export interface ReportHistoryResponse {
  reports: ReportHistoryItem[];
  total: number;
}
