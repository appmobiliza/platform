import { z } from "zod";

export const requestStatusSchema = z.enum(["pending", "assigned", "in_progress", "completed", "cancelled"]);
export type RequestStatus = z.infer<typeof requestStatusSchema>;

export const createRequestInputSchema = z.object({
  studentId: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  notes: z.string().optional(),
  requestedAt: z.string().datetime().optional(),
});
export type CreateRequestInput = z.infer<typeof createRequestInputSchema>;

export const requestRecordSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  notes: z.string().optional(),
  status: requestStatusSchema,
  assignedAssistantId: z.string().optional(),
  requestedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type RequestRecord = z.infer<typeof requestRecordSchema>;