import { UpdateScholarSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";

import { z } from "zod";

export const updateScholar = protectedProcedure
	.input(UpdateScholarSchema)

	.mutation(async ({ ctx, input }) => {
		const [profile] = await db
			.update(schema.scholarProfile)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(schema.scholarProfile.userId, ctx.session.user.id))
			.returning();

		return profile;
	});
