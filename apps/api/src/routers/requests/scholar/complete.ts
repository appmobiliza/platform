import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq, isNull } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";

export const complete = scholarProcedure
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

		if (!attendance?.startedAt) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "O deslocamento ainda não foi iniciado.",
			});
		}

		const now = new Date();
		const durationSeconds = Math.floor(
			(now.getTime() - attendance.startedAt.getTime()) / 1000,
		);

		// Neon HTTP driver does not support transactions.
		// Atomicity is achieved via conditional WHERE clauses.
		await db
			.update(schema.serviceRequest)
			.set({ status: "completed", updatedAt: now })
			.where(
				and(
					eq(schema.serviceRequest.id, input.requestId),
					eq(schema.serviceRequest.status, "ongoing"),
				),
			);

		await db
			.update(schema.serviceAttendance)
			.set({ completedAt: now, durationSeconds, updatedAt: now })
			.where(
				and(
					eq(schema.serviceAttendance.id, attendance.id),
					isNull(schema.serviceAttendance.completedAt),
				),
			);

		try {
			await ctx.realtime.publish(
				`request:${input.requestId}`,
				"request:completed",
				{ requestId: input.requestId, durationSeconds },
			);
		} catch (error) {
			console.error(
				"[Realtime] Failed to publish request:completed event:",
				error,
			);
		}

		return { durationSeconds };
	});
