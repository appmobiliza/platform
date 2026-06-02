import { insertScholarSchema, insertStudentSchema } from "@mobiliza/contracts";

import { z } from "zod";

export const ProfileNameSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Nome deve ter pelo menos 2 caracteres")
		.max(50),
	nickname: insertStudentSchema.shape.nickname
});

export const ProfileGenderSchema = insertStudentSchema.pick({ gender: true });

export const ProfilePhoneSchema = insertStudentSchema.pick({ phone: true });

export const ProfileCpfSchema = insertScholarSchema.pick({ cpf: true });

export const ProfileEmailSchema = z.object({
	email: z.string().trim().email("E-mail inválido"),
});

export const BasicInfoSchema = z.object({
	...ProfileNameSchema.shape,
	...ProfilePhoneSchema.shape,
	...ProfileGenderSchema.shape,
});

export type ProfileNameInput = z.infer<typeof ProfileNameSchema>;
export type ProfileGenderInput = z.infer<typeof ProfileGenderSchema>;
export type ProfilePhoneInput = z.infer<typeof ProfilePhoneSchema>;
export type ProfileCpfInput = z.infer<typeof ProfileCpfSchema>;
export type ProfileEmailInput = z.infer<typeof ProfileEmailSchema>;
export type BasicInfoInput = z.infer<typeof BasicInfoSchema>;
