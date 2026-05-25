import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  unique,
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
  "other",
]);

/**
 * Turnos preferenciais do estudante. Estudantes podem selecionar
 * qualquer turno, incluindo integral (manhã + tarde).
 */
export const studentShiftEnum = pgEnum("student_shift", [
  "morning",
  "afternoon",
  "night",
  "full_day",
]);

/**
 * Turnos de atuação dos bolsistas, conforme definidos no edital NAC.
 * Bolsistas NÃO podem ter turno integral — atuam em um turno específico.
 */
export const scholarShiftEnum = pgEnum("scholar_shift", [
  "morning",
  "afternoon",
  "night",
]);

/*
 * Gênero do estudante.
 */
export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "non_binary",
  "prefer_not_to_say",
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
  campus: text("campus").notNull(),
  phone: text("phone").notNull(),
  shift: studentShiftEnum("shift").notNull(),
  gender: genderEnum("gender").notNull(),

  /*
   * Apelido (opcional) do estudante.
   */
  nickname: text("nickname"),

  /*
   * Campo livre para o estudante informar preferências de atendimento,
   * como "prefere áudio descrição contínua" ou "usa cadeira de rodas elétrica".
   * Exibido ao bolsista antes e durante o atendimento.
   */
  attendanceNotes: text("attendance_notes"),

  /*
   * Quando ativo, a interface do app é simplificada para usuários com
   * baixa visão.
   */
  simplifiedInterface: boolean("simplified_interface")
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
  campus: text("campus").notNull(),
  phone: text("phone").notNull(),
  shift: scholarShiftEnum("shift").notNull(),

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

/**
 * Tabela para cadastrar os tipos de deficiência que um estudante pode ter.
 */
export const studentDisability = pgTable(
  "student_disability",
  {
    id: text("id").primaryKey(),

    studentProfileId: text("student_profile_id")
      .notNull()
      .references(() => studentProfile.id, { onDelete: "cascade" }),

    disabilityType: disabilityTypeEnum("disability_type").notNull(),
  },
  (table) => [unique().on(table.studentProfileId, table.disabilityType)],
);

export type StudentProfile = typeof studentProfile.$inferSelect;
export type NewStudentProfile = typeof studentProfile.$inferInsert;
export type ScholarProfile = typeof scholarProfile.$inferSelect;
export type NewScholarProfile = typeof scholarProfile.$inferInsert;
export type StudentDisability = typeof studentDisability.$inferSelect;
export type NewStudentDisability = typeof studentDisability.$inferInsert;
