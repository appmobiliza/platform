/**
 * Mock do módulo @mobiliza/db/schema
 *
 * Exporta os tipos e valores necessários para os testes unitários.
 * Não conecta ao banco real — usa dados em memória.
 */

import { pgTable, text, timestamp, boolean, integer, unique } from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const campusValues = [
  "Campus A.C. Simões",
  "Campus CECA",
  "Campus Arapiraca",
  "Campus Sertão",
] as const;

export const courseValues = [
  "Pedagogia",
  "Ciência da Computação",
  "Engenharia Civil",
  "Direito",
  "Medicina",
] as const;

export const disabilityTypeValues = [
  "physical_disability",
  "reduced_mobility",
  "blindness",
  "low_vision",
  "deafness",
  "hard_of_hearing",
  "deafblindness",
  "other",
] as const;

export const genderValues = [
  "male",
  "female",
  "non_binary",
  "prefer_not_to_say",
] as const;

export const notificationTypeValues = [
  "new_request_available",
  "request_accepted",
  "request_unattended",
  "attendance_started",
  "attendance_completed",
  "scholar_approved",
  "scholar_rejected",
] as const;

export const requestStatusValues = [
  "pending",
  "accepted",
  "ongoing",
  "completed",
  "cancelled",
  "unattended",
] as const;

export const scholarShiftValues = ["morning", "afternoon", "night"] as const;
export const studentShiftValues = ["morning", "afternoon", "night", "full_day"] as const;

// ─── Auth Tables (Better Auth) ────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role", { enum: ["student", "scholar", "manager"] }).notNull().default("student"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Profile Tables ────────────────────────────────────────────────────────────

export const studentProfile = pgTable("student_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  enrollment: text("enrollment").notNull().unique(),
  course: text("course").notNull(),
  campus: text("campus").notNull(),
  phone: text("phone").notNull(),
  shift: text("shift").notNull(),
  gender: text("gender").notNull(),
  nickname: text("nickname"),
  attendanceNotes: text("attendance_notes"),
  simplifiedInterface: boolean("simplified_interface").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const scholarProfile = pgTable("scholar_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  enrollment: text("enrollment").notNull().unique(),
  course: text("course").notNull(),
  campus: text("campus").notNull(),
  phone: text("phone").notNull(),
  cpf: text("cpf").notNull().unique(),
  shift: text("shift").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),
  isAvailable: boolean("is_available").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const studentDisability = pgTable(
  "student_disability",
  {
    id: text("id").primaryKey(),
    studentProfileId: text("student_profile_id").notNull().references(() => studentProfile.id, { onDelete: "cascade" }),
    disabilityType: text("disability_type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [unique().on(table.studentProfileId, table.disabilityType)],
);

// ─── Location Table ────────────────────────────────────────────────────────────

export const campusLocation = pgTable("campus_location", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  description: text("description"),
  latitude: integer("latitude").notNull(),
  longitude: integer("longitude").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Request Tables ────────────────────────────────────────────────────────────

export const serviceRequest = pgTable("service_request", {
  id: text("id").primaryKey(),
  studentProfileId: text("student_profile_id").notNull().references(() => studentProfile.id, { onDelete: "restrict" }),
  originLocationId: text("origin_location_id").notNull().references(() => campusLocation.id, { onDelete: "restrict" }),
  destinationLocationId: text("destination_location_id").notNull().references(() => campusLocation.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const serviceAttendance = pgTable("service_attendance", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().unique().references(() => serviceRequest.id, { onDelete: "restrict" }),
  scholarProfileId: text("scholar_profile_id").notNull().references(() => scholarProfile.id, { onDelete: "restrict" }),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  durationSeconds: integer("duration_seconds"),
  rating: integer("rating"),
  ratingComment: text("rating_comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Extras Tables ────────────────────────────────────────────────────────────

export const audioMessage = pgTable("audio_message", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().references(() => serviceRequest.id, { onDelete: "cascade" }),
  audioUrl: text("audio_url").notNull(),
  durationSeconds: integer("duration_seconds"),
  transcription: text("transcription"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const favoriteRoute = pgTable("favorite_route", {
  id: text("id").primaryKey(),
  studentProfileId: text("student_profile_id").notNull().references(() => studentProfile.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  originLocationId: text("origin_location_id").notNull().references(() => campusLocation.id, { onDelete: "restrict" }),
  destinationLocationId: text("destination_location_id").notNull().references(() => campusLocation.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  resourceId: text("resource_id"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type StudentProfile = typeof studentProfile.$inferSelect;
export type NewStudentProfile = typeof studentProfile.$inferInsert;
export type ScholarProfile = typeof scholarProfile.$inferSelect;
export type NewScholarProfile = typeof scholarProfile.$inferInsert;
export type StudentDisability = typeof studentDisability.$inferSelect;
export type CampusLocation = typeof campusLocation.$inferSelect;
export type ServiceRequest = typeof serviceRequest.$inferSelect;
export type NewServiceRequest = typeof serviceRequest.$inferInsert;
export type ServiceAttendance = typeof serviceAttendance.$inferSelect;
export type NewServiceAttendance = typeof serviceAttendance.$inferInsert;
export type Notification = typeof notification.$inferSelect;