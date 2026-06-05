import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const toggleAvailability = scholarProcedure
	.mutation(async ({ ctx }) => {
		const profile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

		const [updated] = await db
			.update(schema.scholarProfile)
			.set({
				isAvailable: !profile.isAvailable,
				updatedAt: new Date(),
			})
			.where(eq(schema.scholarProfile.id, profile.id))
			.returning();

		return updated;
	});
