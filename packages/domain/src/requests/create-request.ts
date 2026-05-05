import type { CreateRequestInput, RequestRecord } from "@mobiliza/contracts";
import type { RequestRepository } from "../ports.js";

export async function createRequest(input: CreateRequestInput, requestRepository: RequestRepository): Promise<RequestRecord> {
  const now = new Date().toISOString();
  const requestRecord: RequestRecord = {
    id: `request_${Date.now()}`,
    studentId: input.studentId,
    origin: input.origin,
    destination: input.destination,
    notes: input.notes,
    status: "pending",
    requestedAt: input.requestedAt ?? now,
    createdAt: now,
    updatedAt: now,
  };

  return requestRepository.create(requestRecord);
}