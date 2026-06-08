import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq, isNull } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";

export const start = scholarProcedure
	.input(RequestIdSchema)

	.mutation(async ({ ctx, input }) => {
		const scholarProfile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!scholarProfile) throw new TRPCError({ code: "FORBIDDEN" });

		const attendance = await db.query.serviceAttendance.findFirst({
			where: and(
				eq(schema.serviceAttendance.requestId, input.requestId),
				eq(
					schema.serviceAttendance.scholarProfileId,
					scholarProfile.id,
				),
			),
		});

		if (!attendance) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Atendimento não encontrado.",
			});
		}

		const now = new Date();

		// Neon HTTP driver does not support transactions.
		// Atomicity is achieved via conditional WHERE clauses.
		await db
			.update(schema.serviceRequest)
			.set({ status: "ongoing", updatedAt: now })
			.where(
				and(
					eq(schema.serviceRequest.id, input.requestId),
					eq(schema.serviceRequest.status, "accepted"),
				),
			);

		await db
			.update(schema.serviceAttendance)
			.set({ startedAt: now, updatedAt: now })
			.where(
				and(
					eq(schema.serviceAttendance.id, attendance.id),
					isNull(schema.serviceAttendance.startedAt),
				),
			);

		try {
			await ctx.realtime.publish(
				`request:${input.requestId}`,
				"request:started",
				{ requestId: input.requestId },
			);
		} catch (error) {
			console.error(
				"[Realtime] Failed to publish request:started event:",
				error,
			);
		}

		return { success: true };
	});
