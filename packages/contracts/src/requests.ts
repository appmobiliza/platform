export type RequestStatus = "pending" | "assigned" | "in_progress" | "completed" | "cancelled";

export interface CreateRequestInput {
  studentId: string;
  origin: string;
  destination: string;
  notes?: string;
  requestedAt?: string;
}

export interface RequestRecord {
  id: string;
  studentId: string;
  origin: string;
  destination: string;
  notes?: string;
  status: RequestStatus;
  assignedAssistantId?: string;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
}