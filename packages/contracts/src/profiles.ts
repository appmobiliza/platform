import { z } from "zod";

import {
	campusValues,
	courseValues,
	dayOfWeekValues,
	disabilityTypeValues,
	extraShiftReasonValues,
	genderValues,
	scholarShiftValues,
	studentShiftValues,
} from "./enums";

const SharedProfileSchema = {
	enrollment: z.string().refine(
		(val) => {
			const digitsOnly = val.replace(/\D/g, "");
			return digitsOnly.length >= 5 && digitsOnly.length <= 20;
		},
		{ message: "Matrícula inválida" },
	),
	campus: z.enum(campusValues),
	phone: z
		.string()
		.regex(/^\(?\d{2}\)?[\s]?\d{4,5}[\s-]?\d{4}$/, "Telefone inválido"),
	gender: z.enum(genderValues, { error: "Gênero deve ser selecionado" }),
};

export const InsertScholarSchema = z.object({
	...SharedProfileSchema,
	course: z.string(),
	shift: z.enum(scholarShiftValues),
	cpf: z
		.string()
		.regex(/^(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/, "CPF inválido"),
});

export const UpdateScholarSchema = InsertScholarSchema.partial();

// ─── Weekly Schedule ───────────────────────────────────────────────────────────

const ScheduleEntrySchema = z.object({
	dayOfWeek: z.enum(dayOfWeekValues),
	shift: z.enum(scholarShiftValues),
});

/**
 * Schema for upserting the authenticated scholar's own schedule.
 */
export const UpsertScheduleSchema = z.object({
	entries: z.array(ScheduleEntrySchema),
});

export type UpsertScheduleInput = z.infer<typeof UpsertScheduleSchema>;

/**
 * Schema for a manager to update any scholar's schedule.
 */
export const UpdateScholarScheduleSchema = z.object({
	scholarId: z.string(),
	entries: z.array(ScheduleEntrySchema),
});

export type UpdateScholarScheduleInput = z.infer<
	typeof UpdateScholarScheduleSchema
>;

// ─── Extra Shift Request ───────────────────────────────────────────────────────

/**
 * Schema for a scholar to request an extra shift.
 *
 * A data é definida automaticamente como a data da requisição,
 * pois o bolsista só pode solicitar quando está fora do turno regular.
 * O motivo é selecionado a partir de opções pré-definidas, com
 * campo opcional para detalhamento adicional.
 */
export const CreateExtraShiftRequestSchema = z.object({
	shift: z.enum(scholarShiftValues),
	reason: z.enum(extraShiftReasonValues),
	customReason: z.string().max(500).optional(),
});

export type CreateExtraShiftRequestInput = z.infer<
	typeof CreateExtraShiftRequestSchema
>;

/**
 * Schema for a manager to approve or reject an extra shift request.
 */
export const ReviewExtraShiftRequestSchema = z.object({
	id: z.string(),
	status: z.enum(["approved", "rejected"]),
});

export type ReviewExtraShiftRequestInput = z.infer<
	typeof ReviewExtraShiftRequestSchema
>;

export const InsertStudentSchema = z.object({
	...SharedProfileSchema,
	course: z.enum(courseValues),
	shift: z.enum(studentShiftValues),
	nickname: z.string().optional(),
	attendanceNotes: z.string().optional(),
	simplifiedInterface: z.boolean().optional(),
	disabilityTypes: z
		.array(z.enum(disabilityTypeValues), {
			error: "Tipo de deficiência deve ser selecionado",
		})
		.min(1, { message: "Tipo de deficiência deve ser selecionado" }),
});

export const UpdateStudentSchema = InsertStudentSchema.partial();
