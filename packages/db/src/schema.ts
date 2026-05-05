import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const requests = pgTable("requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: text("student_id").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  notes: text("notes"),
  status: text("status", {
    enum: ["pending", "assigned", "in_progress", "completed", "cancelled"],
  })
    .notNull()
    .default("pending"),
  assignedAssistantId: text("assigned_assistant_id"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
