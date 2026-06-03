import { z } from "zod";

import {
	campusValues,
	courseValues,
	disabilityTypeValues,
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
