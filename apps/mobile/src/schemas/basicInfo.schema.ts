import { z } from "zod";

import { validatePhone } from "@/utils";

export const BasicInfoSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Nome deve ter pelo menos 2 caracteres")
		.max(100),
	phone: z.string().refine(validatePhone, "Telefone inválido"),
	gender: z.string().min(1, "Selecione seu gênero"),
});

export type BasicInfoInput = z.infer<typeof BasicInfoSchema>;
