export interface ReportType {
  ID: number;
  type_name: string;
}

export interface ReportStatus {
  ID: number;
  status_name: string;
}

export interface Members {
  ID: number;
  name: string;
  email: string;
  username: string;
}

export interface Report {
  ID: number;
  topic: string;
  description: string;
  photo?: string;
  created_at: string;
  updated_at: string;
  members?: Members;
  report_status?: ReportStatus;
  report_type?: ReportType;
  members_id: number;
  report_status_id: number;
  report_type_id: number;
}

export interface CreateReportRequest {
  topic: string;
  description: string;
  photo?: string;
  members_id?: number;
  report_type_id: number;
  report_status_id?: number;
}