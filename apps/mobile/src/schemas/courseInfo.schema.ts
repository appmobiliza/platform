import { z } from "zod";

export const CourseInfoSchema = z.object({
	course: z.string().min(1, "Selecione o curso"),
	shift: z.string().min(1, "Selecione o turno"),
	campus: z.string().min(1, "Selecione o campus"),
	matricula: z.string().regex(/^\d{5,20}$/, "Matrícula inválida"),
});

export type CourseInfoInput = z.infer<typeof CourseInfoSchema>;
