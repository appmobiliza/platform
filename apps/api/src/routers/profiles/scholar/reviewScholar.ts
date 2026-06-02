import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { managerProcedure } from "@/trpc/context";

export const reviewScholar = managerProcedure
	.meta({ openapi: { method: "POST", path: "/profiles/review-scholar" } })
	.input(
		z.object({
			scholarProfileId: z.string(),
			approved: z.boolean(),
		}),
	)
	.output(z.any())
	.mutation(async ({ ctx, input }) => {
		const profile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.id, input.scholarProfileId),
			with: { user: true },
		});

		if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

		const now = new Date();

		const [updated] = await db
			.update(schema.scholarProfile)
			.set({
				isApproved: input.approved,
				isActive: input.approved,
				approvedAt: input.approved ? now : null,
				approvedBy: input.approved ? ctx.session.user.id : null,
				updatedAt: now,
			})
			.where(eq(schema.scholarProfile.id, input.scholarProfileId))
			.returning();

		// Notificação via realtime para o bolsista
		await ctx.realtime.publish(
			`user:${profile.userId}`,
			input.approved ? "scholar:approved" : "scholar:rejected",
			{ scholarProfileId: input.scholarProfileId },
		);

		return updated;
	});
