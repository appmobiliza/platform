import { ReviewExtraShiftRequestSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { managerProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const reviewExtraShiftRequest = managerProcedure
	.input(ReviewExtraShiftRequestSchema)

	.mutation(async ({ ctx, input }) => {
		const request = await db.query.extraShiftRequest.findFirst({
			where: eq(schema.extraShiftRequest.id, input.id),
		});

		if (!request) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}

		if (request.status !== "pending") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Esta solicitação já foi revisada.",
			});
		}

		const [updated] = await db
			.update(schema.extraShiftRequest)
			.set({
				status: input.status,
				approvedById: ctx.session.user.id,
				approvedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.extraShiftRequest.id, input.id))
			.returning();

		return updated;
	});
