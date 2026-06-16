import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { managerProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const toggleScholarActiveStatus = managerProcedure
	.input(z.object({ userId: z.string() }))
	.mutation(async ({ input }) => {
		const profile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, input.userId),
		});

		if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

		const [updated] = await db
			.update(schema.scholarProfile)
			.set({
				isActive: !profile.isActive,
				updatedAt: new Date(),
			})
			.where(eq(schema.scholarProfile.id, profile.id))
			.returning();

		return updated;
	});
