import { RateRequestSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";

export const rate = protectedProcedure
	.input(RateRequestSchema)

	.mutation(async ({ ctx, input }) => {
		const studentProfile = await db.query.studentProfile.findFirst({
			where: eq(schema.studentProfile.userId, ctx.session.user.id),
		});

		if (!studentProfile) throw new TRPCError({ code: "FORBIDDEN" });

		const request = await db.query.serviceRequest.findFirst({
			where: and(
				eq(schema.serviceRequest.id, input.requestId),
				eq(schema.serviceRequest.studentProfileId, studentProfile.id),
				eq(schema.serviceRequest.status, "completed"),
			),
		});

		if (!request) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Atendimento concluído não encontrado.",
			});
		}

		await db
			.update(schema.serviceAttendance)
			.set({
				rating: input.rating,
				ratingComment: input.comment,
				updatedAt: new Date(),
			})
			.where(eq(schema.serviceAttendance.requestId, input.requestId));

		return { success: true };
	});
