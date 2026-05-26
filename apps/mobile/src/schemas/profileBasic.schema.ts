import { z } from "zod";

import { validateCpf, validatePhone } from "@/utils";

export const ProfileNameSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(2, "Nome deve ter pelo menos 2 caracteres")
		.max(50),
	lastName: z
		.string()
		.trim()
		.min(2, "Sobrenome deve ter pelo menos 2 caracteres")
		.max(80),
});

export const ProfileGenderSchema = z.object({
	gender: z.enum([
		"Masculino",
		"Feminino",
		"Não binário",
		"Prefiro não dizer",
	]),
});

export const ProfilePhoneSchema = z.object({
	phone: z.string().refine(validatePhone, "Telefone inválido"),
});

export const ProfileCpfSchema = z.object({
	cpf: z.string().refine(validateCpf, "CPF inválido"),
});

export const ProfileEmailSchema = z.object({
	email: z.string().trim().email("E-mail inválido"),
});

export type ProfileNameInput = z.infer<typeof ProfileNameSchema>;
export type ProfileGenderInput = z.infer<typeof ProfileGenderSchema>;
export type ProfilePhoneInput = z.infer<typeof ProfilePhoneSchema>;
export type ProfileCpfInput = z.infer<typeof ProfileCpfSchema>;
export type ProfileEmailInput = z.infer<typeof ProfileEmailSchema>;
