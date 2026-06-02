import {
	campusValues,
	courseValues,
	scholarShiftValues,
} from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";

import { uuidv7 } from "uuidv7";
import { z } from "zod";

import { protectedProcedure } from "@/trpc/context";

export const createScholar = protectedProcedure
	.meta({ openapi: { method: "POST", path: "/profiles/scholar" } })
	.input(
		z.object({
			enrollment: z.string().min(4).max(20),
			course: z.enum(courseValues),
			campus: z.enum(campusValues),
			shift: z.enum(scholarShiftValues),
			phone: z.string().regex(/^\d{10,11}$/),
			cpf: z.string().regex(/^\d{11}$/),
		}),
	)
	.output(z.any())
	.mutation(async ({ ctx, input }) => {
		const existing = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (existing) return existing;

		await db
			.update(schema.user)
			.set({ role: "scholar", updatedAt: new Date() })
			.where(eq(schema.user.id, ctx.session.user.id));

		const [profile] = await db
			.insert(schema.scholarProfile)
			.values({
				id: uuidv7(),
				userId: ctx.session.user.id,
				...input,
				isApproved: false,
				isAvailable: false,
			})
			.returning();

		return profile;
	});
