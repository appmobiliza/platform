import { z } from 'zod';

export const BasicInfoSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  gender: z.string().min(1, 'Selecione seu gênero'),
});

export type BasicInfoInput = z.infer<typeof BasicInfoSchema>;