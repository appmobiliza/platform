import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq, inArray, isNull } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";

export const reportIssue = scholarProcedure
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

		if (attendance.completedAt) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Este atendimento já foi concluído.",
			});
		}

		const now = new Date();

		// Neon HTTP driver does not support transactions.
		// Atomicity is achieved via conditional WHERE clauses.
		const [updatedRequest] = await db
			.update(schema.serviceRequest)
			.set({ status: "cancelled", updatedAt: now })
			.where(
				and(
					eq(schema.serviceRequest.id, input.requestId),
					inArray(schema.serviceRequest.status, ["accepted", "ongoing"]),
				),
			)
			.returning({ id: schema.serviceRequest.id });

		if (!updatedRequest) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message:
					"Não foi possível cancelar o atendimento. A solicitação pode já ter sido concluída ou cancelada.",
			});
		}

		await db
			.update(schema.serviceAttendance)
			.set({ completedAt: now, updatedAt: now })
			.where(
				and(
					eq(schema.serviceAttendance.id, attendance.id),
					isNull(schema.serviceAttendance.completedAt),
				),
			);

		try {
			await ctx.realtime.publish(
				`request:${input.requestId}`,
				"request:cancelled",
				{ requestId: input.requestId },
			);
		} catch (error) {
			console.error(
				"[Realtime] Failed to publish request:cancelled event:",
				error,
			);
		}

		return { success: true };
	});
