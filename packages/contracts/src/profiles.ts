import { z } from "zod";

import { genderValues, scholarShiftValues, studentShiftValues } from "./enums";

export const CreateStudentSchema = z.object({
	enrollment: z.string().min(5),
	course: z.string().min(1),
	campus: z.string().min(1),
	phone: z.string().min(10).max(11),
	shift: z.enum(studentShiftValues),
	gender: z.enum(genderValues),
	disabilityTypes: z.array(z.string()).min(1),
	needsAudioDescription: z.boolean().default(false),
});

export const CreateScholarSchema = z.object({
	enrollment: z.string().min(5),
	course: z.string().min(1),
	campus: z.string().min(1),
	phone: z.string().min(10).max(11),
	cpf: z.string().length(11),
	shift: z.enum(scholarShiftValues),
});

export const ReviewScholarSchema = z.object({
	scholarProfileId: z.string(),
	approved: z.boolean(),
});
