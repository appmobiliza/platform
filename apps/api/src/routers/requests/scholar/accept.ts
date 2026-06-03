import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db";
import { and, eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

import { scholarProcedure } from "@/trpc/context";

export const accept = scholarProcedure
	.meta({ openapi: { method: "POST", path: "/requests/accept" } })
	.input(RequestIdSchema)
	.output(z.any())
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

		// Transação atômica para evitar race condition entre bolsistas
		const result = await db.transaction(async (tx) => {
			const request = await tx.query.serviceRequest.findFirst({
				where: and(
					eq(schema.serviceRequest.id, input.requestId),
					eq(schema.serviceRequest.status, "pending"),
				),
			});

			if (!request) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message:
						"Solicitação não encontrada ou já foi aceita por outro bolsista.",
				});
			}

			const now = new Date();

			// Atualiza o status da solicitação
			await tx
				.update(schema.serviceRequest)
				.set({ status: "accepted", respondedAt: now, updatedAt: now })
				.where(eq(schema.serviceRequest.id, input.requestId));

			// Cria o registro de atendimento
			const [attendance] = await tx
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
					},
				);
			} catch (publishError) {
				console.error(
					"[Realtime] Failed to publish request:accepted event:",
					publishError,
				);
			}

			return { request: { ...request, status: "accepted" }, attendance };
		});

		return result;
	});
