import { z } from "zod";

import {
	campusValues,
	courseValues,
	disabilityTypeValues,
	genderValues,
	scholarShiftValues,
	studentShiftValues,
} from "./enums";

const sharedProfileSchema = {
	enrollment: z.string().min(4).max(20),
	campus: z.enum(campusValues),
	phone: z.string().regex(/^\d{10,11}$/),
	gender: z.enum(genderValues),
};

export const insertScholarSchema = z.object({
	...sharedProfileSchema,
	course: z.string(),
	shift: z.enum(scholarShiftValues),
	cpf: z.string().regex(/^\d{11}$/),
});

export const updateScholarSchema = insertScholarSchema.partial();

export const insertStudentSchema = z.object({
	...sharedProfileSchema,
	course: z.enum(courseValues),
	shift: z.enum(studentShiftValues),
	nickname: z.string().optional(),
	attendanceNotes: z.string().optional(),
	disabilityTypes: z.array(z.enum(disabilityTypeValues)).min(1),
});

export const updateStudentSchema = insertStudentSchema.partial();
