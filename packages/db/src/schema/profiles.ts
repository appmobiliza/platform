import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

import { user } from "./auth";
import {
	campusEnum,
	courseEnum,
	disabilityTypeEnum,
	genderEnum,
	scholarShiftEnum,
	studentShiftEnum,
} from "./enums";

const sharedProfileColumns = {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: "cascade" }),
	enrollment: text("enrollment").notNull().unique(),
	campus: campusEnum("campus").notNull(),
	phone: text("phone").notNull(),
	gender: genderEnum("gender").notNull(),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
} as const;

/**
 * Perfil do estudante com deficiência.
 * Estende `user` com informações específicas necessárias para o atendimento.
 */
export const studentProfile = pgTable("student_profile", {
	...sharedProfileColumns,
	course: courseEnum("course").notNull(),
	shift: studentShiftEnum("shift").notNull(),
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
	simplifiedInterface: boolean("simplified_interface").notNull().default(false),
});

/**
 * Perfil do bolsista do NAC.
 * Um bolsista precisa ser aprovado pela coordenação antes de poder
 * receber solicitações. O campo `approvedAt` serve como evidência
 * de quando a aprovação ocorreu.
 */
export const scholarProfile = pgTable("scholar_profile", {
	...sharedProfileColumns,
	course: text("course").notNull(),
	shift: scholarShiftEnum("shift").notNull(),
	cpf: text("cpf").notNull().unique(),
	/*
	 * Controlado pelo próprio bolsista no app — indica se ele está apto a
	 * receber solicitações no momento atual, dentro do seu turno.
	 */
	isAvailable: boolean("is_available").notNull().default(false),
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

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [unique().on(table.studentProfileId, table.disabilityType)],
);

export type StudentProfile = typeof studentProfile.$inferSelect;
export type NewStudentProfile = typeof studentProfile.$inferInsert;
export type ScholarProfile = typeof scholarProfile.$inferSelect;
export type NewScholarProfile = typeof scholarProfile.$inferInsert;
export type StudentDisability = typeof studentDisability.$inferSelect;
export type NewStudentDisability = typeof studentDisability.$inferInsert;

// ─── Relations ───────────────────────────────────────────────────────────────

export const studentProfileRelations = relations(studentProfile, ({ one, many }) => ({
	user: one(user, {
		fields: [studentProfile.userId],
		references: [user.id],
	}),
	disabilities: many(studentDisability),
	requests: many(serviceRequest),
}));

export const scholarProfileRelations = relations(scholarProfile, ({ one, many }) => ({
	user: one(user, {
		fields: [scholarProfile.userId],
		references: [user.id],
	}),
	attendances: many(serviceAttendance),
}));

export const studentDisabilityRelations = relations(studentDisability, ({ one }) => ({
	studentProfile: one(studentProfile, {
		fields: [studentDisability.studentProfileId],
		references: [studentProfile.id],
	}),
}));

// ─── Import serviceRequest here for relations ─────────────────────────────────
import { serviceAttendance, serviceRequest } from "./requests";
