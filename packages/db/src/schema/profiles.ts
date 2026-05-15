import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * Tipos de deficiência reconhecidos pelo NAC, alinhados com a
 * Lei Brasileira de Inclusão (Lei nº 13.146/2015) e com o edital
 * de seleção de bolsistas do NAC/UFAL.
 */
export const disabilityTypeEnum = pgEnum("disability_type", [
  "motor",
  "visual",
  "auditory",
  "deafblind",
  "autism",
  "multiple",
  "other",
]);

/**
 * Turnos de atuação dos bolsistas, conforme definidos no edital NAC.
 */
export const shiftEnum = pgEnum("shift", [
  "morning",
  "afternoon",
  "night",
]);

/**
 * Perfil do estudante com deficiência.
 * Estende `user` com informações específicas necessárias para o atendimento.
 */
export const studentProfile = pgTable("student_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  enrollment: text("enrollment").notNull().unique(),
  course: text("course").notNull(),

  disabilityType: disabilityTypeEnum("disability_type").notNull(),

  /*
   * Campo livre para o estudante informar preferências de atendimento,
   * como "prefere áudio descrição contínua" ou "usa cadeira de rodas elétrica".
   * Exibido ao bolsista antes e durante o atendimento.
   */
  attendanceNotes: text("attendance_notes"),

  /*
   * Quando ativo, o app lê automaticamente as atualizações de status em voz
   * alta via Text-to-Speech — pensado para usuários com deficiência visual.
   */
  audioResponseEnabled: boolean("audio_response_enabled")
    .notNull()
    .default(false),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Perfil do bolsista do NAC.
 * Um bolsista precisa ser aprovado pela coordenação antes de poder
 * receber solicitações. O campo `approvedAt` serve como evidência
 * de quando a aprovação ocorreu.
 */
export const scholarProfile = pgTable("scholar_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),

  enrollment: text("enrollment").notNull().unique(),
  course: text("course").notNull(),
  shift: shiftEnum("shift").notNull(),

  /*
   * Bolsistas precisam ser aprovados pela coordenação do NAC antes de
   * aparecerem como disponíveis no sistema.
   */
  isApproved: boolean("is_approved").notNull().default(false),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by").references(() => user.id, {
    onDelete: "set null",
  }),

  /*
   * Controlado pelo próprio bolsista no app — indica se ele está apto a
   * receber solicitações no momento atual, dentro do seu turno.
   */
  isAvailable: boolean("is_available").notNull().default(false),

  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type StudentProfile = typeof studentProfile.$inferSelect;
export type NewStudentProfile = typeof studentProfile.$inferInsert;
export type ScholarProfile = typeof scholarProfile.$inferSelect;
export type NewScholarProfile = typeof scholarProfile.$inferInsert;
