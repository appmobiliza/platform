import { updateScholarSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";

import { z } from "zod";

import { protectedProcedure } from "@/trpc/context";

export const updateScholar = protectedProcedure
	.meta({ openapi: { method: "PATCH", path: "/profiles/scholar" } })
	.input(updateScholarSchema)
	.output(z.any())
	.mutation(async ({ ctx, input }) => {
		const [profile] = await db
			.update(schema.scholarProfile)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(schema.scholarProfile.userId, ctx.session.user.id))
			.returning();

		return profile;
	});
