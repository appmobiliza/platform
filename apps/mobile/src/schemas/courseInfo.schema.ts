import { z } from 'zod';

export const CourseInfoSchema = z.object({
  course: z.string().min(1, 'Selecione o curso'),
  shift: z.string().min(1, 'Selecione o turno'),
  campus: z.string().min(1, 'Selecione o campus'),
  matricula: z.string().min(5, 'Matrícula inválida').max(20),
});

export type CourseInfoInput = z.infer<typeof CourseInfoSchema>;