import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq, inArray, isNull } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";

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

		// Rejeita cancelamento se a solicitação já foi finalizada
		if (
			request.status === "completed" ||
			request.status === "cancelled" ||
			request.status === "unattended"
		) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Não é possível cancelar uma solicitação com status "${request.status}".`,
			});
		}

		// O WHERE com inArray funciona como guarda otimista para race conditions:
		// se a solicitação mudou de estado entre a leitura e o update, nada é alterado.
		const [updated] = await db
			.update(schema.serviceRequest)
			.set({
				status: "cancelled",
				// Só define respondedAt na transição pending → cancelled.
				// Se já havia sido aceita (accepted/ongoing), preserva o timestamp original
				// para não corromper a métrica de tempo até a primeira resposta.
				respondedAt:
					request.status === "pending"
						? new Date()
						: request.respondedAt,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(schema.serviceRequest.id, input.requestId),
					inArray(schema.serviceRequest.status, [
						"pending",
						"accepted",
						"ongoing",
					]),
				),
			)
			.returning();

		if (!updated) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message:
					"Não foi possível cancelar a solicitação. Ela pode já ter sido concluída ou cancelada.",
			});
		}

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

		// Notifica os bolsistas disponíveis para remover a solicitação da lista de pendentes
		// (só relevante quando a solicitação ainda estava como "pending")
		if (request.status === "pending") {
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
		}

		return updated;
	});
