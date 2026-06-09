import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db";
import { and, eq, isNull } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";

export const accept = scholarProcedure
	.input(RequestIdSchema)

	.mutation(async ({ ctx, input }) => {
		const scholarProfile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!scholarProfile) {
			throw new TRPCError({ code: "FORBIDDEN" });
		}

		if (!scholarProfile.isAvailable) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message:
					"Você está marcado como indisponível. Ative sua disponibilidade antes de aceitar solicitações.",
			});
		}

		// Busca o turno ativo do bolsista para incluir no evento
		const activeShiftLog = await db.query.scholarShiftLog.findFirst({
			where: and(
				eq(schema.scholarShiftLog.scholarProfileId, scholarProfile.id),
				isNull(schema.scholarShiftLog.endedAt),
			),
		});

		// Update atômico: só avança se a solicitação ainda estiver "pending".
		// O WHERE status = 'pending' em conjunto com RETURNING garante que,
		// mesmo com dois bolsistas aceitando simultaneamente, apenas um
		// conseguirá — é um lock otimista que dispensa transações.
		const now = new Date();

		const [request] = await db
			.update(schema.serviceRequest)
			.set({ status: "accepted", respondedAt: now, updatedAt: now })
			.where(
				and(
					eq(schema.serviceRequest.id, input.requestId),
					eq(schema.serviceRequest.status, "pending"),
				),
			)
			.returning();

		if (!request) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message:
					"Solicitação não encontrada ou já foi aceita por outro bolsista.",
			});
		}

		// Cria o registro de atendimento
		const [attendance] = await db
			.insert(schema.serviceAttendance)
			.values({
				id: uuidv7(),
				requestId: input.requestId,
				scholarProfileId: scholarProfile.id,
				acceptedAt: now,
			})
			.returning();

		// Notifica o estudante via realtime
		try {
			await ctx.realtime.publish(
				`request:${input.requestId}`,
				"request:accepted",
				{
					requestId: input.requestId,
					scholarId: ctx.session.user.id,
					scholarName: ctx.session.user.name,
					scholarImage: ctx.session.user.image ?? null,
					scholarCreatedAt: scholarProfile.createdAt?.toISOString() ?? null,
					scholarShift: activeShiftLog?.shift ?? null,
				},
			);
		} catch (publishError) {
			console.error(
				"[Realtime] Failed to publish request:accepted event:",
				publishError,
			);
		}

		// Notifica os demais bolsistas para remover a solicitação da lista de pendentes
		try {
			await ctx.realtime.publish(
				"requests:pending",
				"request:accepted",
				{ requestId: input.requestId },
			);
		} catch (publishError) {
			console.error(
				"[Realtime] Failed to publish request:accepted to pending channel:",
				publishError,
			);
		}

		return { request, attendance };
	});
