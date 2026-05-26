import { pgEnum } from "drizzle-orm/pg-core";

export const notificationTypeValues = [
  "request_accepted",
  "request_unattended",
  "attendance_started",
  "attendance_completed",
  "scholar_approved",
  "scholar_rejected",
  "new_request_available",
] as const;

export const notificationTypeEnum = pgEnum(
  "notification_type",
  notificationTypeValues,
);