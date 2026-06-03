import { z } from "zod";

export const CreateLocationSchema = z.object({
	name: z.string().min(3),
	abbreviation: z.string().min(2).max(10),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
});

export const SetActiveLocationSchema = z.object({
	id: z.number().int().positive(),
	isActive: z.boolean(),
});
