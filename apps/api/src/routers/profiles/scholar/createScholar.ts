import { InsertScholarSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";

import { uuidv7 } from "uuidv7";
import { z } from "zod";

export const createScholar = protectedProcedure
	.meta({ openapi: { method: "POST", path: "/profiles/scholar" } })
	.input(InsertScholarSchema)
	.output(z.any())
	.mutation(async ({ ctx, input }) => {
		const existing = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (existing) return existing;

		const profile = await db.transaction(async (tx) => {
			await tx
				.update(schema.user)
				.set({ role: "scholar", updatedAt: new Date() })
				.where(eq(schema.user.id, ctx.session.user.id));

			const [profile] = await tx
				.insert(schema.scholarProfile)
				.values({
					id: uuidv7(),
					userId: ctx.session.user.id,
					...input,
					isAvailable: false,
				})
				.returning();

			return profile;
		});

		return profile;
	});
