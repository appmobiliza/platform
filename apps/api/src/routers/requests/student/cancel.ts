import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq, isNull } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const cancel = protectedProcedure
	.input(RequestIdSchema)

	.mutation(async ({ ctx, input }) => {
		const studentProfile = await db.query.studentProfile.findFirst({
			where: eq(schema.studentProfile.userId, ctx.session.user.id),
		});

		if (!studentProfile) {
			throw new TRPCError({ code: "FORBIDDEN" });
		}

		const request = await db.query.serviceRequest.findFirst({
			where: eq(schema.serviceRequest.id, input.requestId),
		});

		if (!request) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Solicitação não encontrada.",
			});
		}

		if (request.studentProfileId !== studentProfile.id) {
			throw new TRPCError({ code: "FORBIDDEN" });
		}

		// if (request.status !== "pending") {
		// 	throw new TRPCError({
		// 		code: "BAD_REQUEST",
		// 		message: `Não é possível cancelar uma solicitação com status "${request.status}".`,
		// 	});
		// }

		const [updated] = await db
			.update(schema.serviceRequest)
			.set({
				status: "cancelled",
				respondedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.serviceRequest.id, input.requestId))
			.returning();

		// Se havia um atendimento em andamento (bolsista já havia aceito),
		// fecha o registro para que não apareça como ativo para o bolsista.
		await db
			.update(schema.serviceAttendance)
			.set({ completedAt: new Date(), updatedAt: new Date() })
			.where(
				and(
					eq(schema.serviceAttendance.requestId, input.requestId),
					isNull(schema.serviceAttendance.completedAt),
				),
			);

		// Notifica o estudante via realtime
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

		// Notifica os bolsistas disponíveis para remover a solicitação da lista
		try {
			await ctx.realtime.publish(
				"requests:pending",
				"request:cancelled",
				{ requestId: input.requestId },
			);
		} catch (error) {
			console.error(
				"[Realtime] Failed to publish request:cancelled to pending channel:",
				error,
			);
		}

		return updated;
	});
