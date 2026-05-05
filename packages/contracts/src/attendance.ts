export type AttendanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface AttendanceRecord {
  id: string;
  requestId: string;
  assistantId: string;
  studentId: string;
  status: AttendanceStatus;
  startedAt: string;
  finishedAt?: string;
}