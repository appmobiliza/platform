import { pgEnum } from "drizzle-orm/pg-core";

export const requestStatusValues = [
  "pending",
  "accepted",
  "ongoing",
  "completed",
  "cancelled",
  "unattended",
] as const;

export const requestStatusEnum = pgEnum(
  "request_status",
  requestStatusValues,
);