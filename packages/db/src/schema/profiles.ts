import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import {
	campusEnum,
	courseEnum,
	dayOfWeekEnum,
	disabilityTypeEnum,
	extraShiftReasonEnum,
	extraShiftRequestStatusEnum,
	genderEnum,
	scholarShiftEnum,
	studentShiftEnum,
} from "./enums";

const sharedProfileColumns = () => ({
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
});

/**
 * Perfil do estudante com deficiência.
 * Estende `user` com informações específicas necessárias para o atendimento.
 */
export const studentProfile = pgTable("student_profile", {
	...sharedProfileColumns(),
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
	simplifiedInterface: boolean("simplified_interface")
		.notNull()
		.default(false),
});

/**
 * Perfil do bolsista do NAC.
 * Um bolsista precisa ser aprovado pela coordenação antes de poder
 * receber solicitações.
 */
export const scholarProfile = pgTable("scholar_profile", {
	...sharedProfileColumns(),
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
/**
 * Grade horária semanal do bolsista.
 * Define em quais dias da semana e turnos o bolsista trabalha.
 */
export const scholarWeeklySchedule = pgTable(
	"scholar_weekly_schedule",
	{
		id: text("id").primaryKey(),

		scholarProfileId: text("scholar_profile_id")
			.notNull()
			.references(() => scholarProfile.id, { onDelete: "cascade" }),

		dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
		shift: scholarShiftEnum("shift").notNull(),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [unique().on(table.scholarProfileId, table.dayOfWeek, table.shift)],
);

/**
 * Solicitação de turno extra feita pelo bolsista para compensar horas não
 * cumpridas (ex: falta por doença, consulta médica, etc.).
 *
 * Um bolsista cria a solicitação informando a data e o turno em que deseja
 * trabalhar extra e o motivo. Um gestor então aprova ou rejeita.
 */
export const extraShiftRequest = pgTable(
	"extra_shift_request",
	{
		id: text("id").primaryKey(),

		scholarProfileId: text("scholar_profile_id")
			.notNull()
			.references(() => scholarProfile.id, { onDelete: "cascade" }),

		/*
		 * Data do turno extra — definida automaticamente como a data
		 * da requisição, já que o bolsista só pode solicitar quando está
		 * fora do seu turno regular.
		 */
		date: date("date").notNull(),

		shift: scholarShiftEnum("shift").notNull(),

		/*
		 * Motivo pré-definido selecionado pelo bolsista.
		 */
		reason: extraShiftReasonEnum("reason").notNull(),

		/*
		 * Motivo personalizado opcional — usado quando o bolsista
		 * seleciona "outro" ou quer detalhar o motivo escolhido.
		 */
		customReason: text("custom_reason"),

		status: extraShiftRequestStatusEnum("status")
			.notNull()
			.default("pending"),

		approvedById: text("approved_by_id").references(
			() => user.id,
			{ onDelete: "set null" },
		),

		approvedAt: timestamp("approved_at"),

		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [unique().on(table.scholarProfileId, table.date, table.shift)],
);

export type StudentDisability = typeof studentDisability.$inferSelect;
export type NewStudentDisability = typeof studentDisability.$inferInsert;
export type ScholarWeeklySchedule = typeof scholarWeeklySchedule.$inferSelect;
export type NewScholarWeeklySchedule =
	typeof scholarWeeklySchedule.$inferInsert;
export type ExtraShiftRequest = typeof extraShiftRequest.$inferSelect;
export type NewExtraShiftRequest = typeof extraShiftRequest.$inferInsert;

// ─── Relations ───────────────────────────────────────────────────────────────

export const studentProfileRelations = relations(
	studentProfile,
	({ one, many }) => ({
		user: one(user, {
			fields: [studentProfile.userId],
			references: [user.id],
		}),
		disabilities: many(studentDisability),
		requests: many(serviceRequest),
	}),
);

export const scholarProfileRelations = relations(
	scholarProfile,
	({ one, many }) => ({
		user: one(user, {
			fields: [scholarProfile.userId],
			references: [user.id],
		}),
		attendances: many(serviceAttendance),
		weeklySchedule: many(scholarWeeklySchedule),
		extraShiftRequests: many(extraShiftRequest),
	}),
);

export const scholarWeeklyScheduleRelations = relations(
	scholarWeeklySchedule,
	({ one }) => ({
		scholarProfile: one(scholarProfile, {
			fields: [scholarWeeklySchedule.scholarProfileId],
			references: [scholarProfile.id],
		}),
	}),
);

export const extraShiftRequestRelations = relations(
	extraShiftRequest,
	({ one }) => ({
		scholarProfile: one(scholarProfile, {
			fields: [extraShiftRequest.scholarProfileId],
			references: [scholarProfile.id],
		}),
		approvedBy: one(user, {
			fields: [extraShiftRequest.approvedById],
			references: [user.id],
		}),
	}),
);

export const studentDisabilityRelations = relations(
	studentDisability,
	({ one }) => ({
		studentProfile: one(studentProfile, {
			fields: [studentDisability.studentProfileId],
			references: [studentProfile.id],
		}),
	}),
);

// ─── Import serviceRequest here for relations ─────────────────────────────────
import { serviceAttendance, serviceRequest } from "./requests";
