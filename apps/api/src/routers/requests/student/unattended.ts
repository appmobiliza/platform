import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";

export const markUnattended = protectedProcedure
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

		if (request.status !== "pending") {
			// Se já está "unattended", é um no-op — evita race condition com o
			// CRON de timeout do backend ou com múltiplas chamadas concorrentes.
			if (request.status === "unattended") {
				return request;
			}

			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Não é possível marcar como não atendida uma solicitação com status "${request.status}".`,
			});
		}

		const [updated] = await db
			.update(schema.serviceRequest)
			.set({
				status: "unattended",
				respondedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.serviceRequest.id, input.requestId))
			.returning();

		try {
			await ctx.realtime.publish(
				`request:${input.requestId}`,
				"request:unattended",
				{ requestId: input.requestId },
			);
		} catch (error) {
			console.error(
				"[Realtime] Failed to publish request:unattended event:",
				error,
			);
		}

		// Notifica os bolsistas disponíveis para remover a solicitação da lista
		try {
			await ctx.realtime.publish(
				"requests:pending",
				"request:unattended",
				{ requestId: input.requestId },
			);
		} catch (error) {
			console.error(
				"[Realtime] Failed to publish request:unattended to pending channel:",
				error,
			);
		}

		return updated;
	});
