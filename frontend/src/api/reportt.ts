import axios from 'axios';
import type { CreateReportRequest, ReportStatus, ReportType, Report } from '../interface/reportinter';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all report types
export const getReportTypes = async (): Promise<ReportType[]> => {
  const response = await api.get<ReportType[]>('/report-types');
  return response.data;
};

// Get all report statuses
export const getReportStatuses = async (): Promise<ReportStatus[]> => {
  const response = await api.get<ReportStatus[]>('/report-status');
  return response.data;
};

// Create a new report with file upload support
export const createReport = async (reportData: {
  topic: string;
  description: string;
  report_type_id: number;
  members_id?: number;
  photo?: File;
}): Promise<Report> => {
  const formData = new FormData();
  
  formData.append('topic', reportData.topic);
  formData.append('description', reportData.description);
  formData.append('report_type_id', reportData.report_type_id.toString());
  
  if (reportData.members_id) {
    formData.append('members_id', reportData.members_id.toString());
  }
  
  if (reportData.photo) {
    formData.append('photo', reportData.photo);
  }

  const response = await axios.post<Report>(`${API_BASE_URL}/reports`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Alternative: Create report with base64 (เก็บไว้สำหรับ backward compatibility)
export const createReportWithBase64 = async (report: CreateReportRequest): Promise<Report> => {
  const response = await axios.post<Report>(`${API_BASE_URL}/reports-base64`, report, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// Get all reports
export const getReports = async (): Promise<Report[]> => {
  const response = await api.get<Report[]>('/reports');
  return response.data;
};

// Get a specific report
export const getReport = async (id: number): Promise<Report> => {
  const response = await api.get<Report>(`/reports/${id}`);
  return response.data;
};

// Update report status
export const updateReportStatus = async (id: number, statusId: number): Promise<Report> => {
  const response = await api.put<Report>(`/reports/${id}/status`, { 
    status_id: statusId 
  });
  return response.data;
};

// Delete a report
export const deleteReport = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/reports/${id}`);
  return response.data;
};

// Get image URL helper function
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  
  // Extract filename from path
  const filename = imagePath.split('/').pop() || imagePath;
  return `${API_BASE_URL}/uploads/reports/${filename}`;
};

// Upload single image (สำหรับใช้แยกต่างหาก)
export const uploadImage = async (file: File): Promise<{ url: string; path: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await axios.post<{ url: string; path: string }>(`${API_BASE_URL}/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};