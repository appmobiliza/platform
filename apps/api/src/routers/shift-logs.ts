/**
 * Router de registro de turnos do bolsista.
 *
 * Gerencia o início e fim do turno do bolsista no app.
 * Cada bolsista pode iniciar seu turno (start) e encerrar (end).
 * Apenas um turno pode estar ativo por vez.
 */

import { EndShiftLogSchema, StartShiftLogSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq, isNull } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { router, scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

export const shiftLogsRouter = router({
	/**
	 * Inicia o turno do bolsista.
	 *
	 * Cria um registro de turno para a data/hora atual.
	 * Se já houver um turno ativo (sem endedAt), retorna erro.
	 * Define isAvailable como true automaticamente.
	 */
	startShift: scholarProcedure
		.input(StartShiftLogSchema)
		.mutation(async ({ ctx, input }) => {
			const profile = await db.query.scholarProfile.findFirst({
				where: eq(schema.scholarProfile.userId, ctx.session.user.id),
			});

			if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

			// Verifica se já existe um turno ativo (sem endedAt) para este bolsista
			const activeLog = await db.query.scholarShiftLog.findFirst({
				where: and(
					eq(schema.scholarShiftLog.scholarProfileId, profile.id),
					isNull(schema.scholarShiftLog.endedAt),
				),
			});

			if (activeLog) {
				throw new TRPCError({
					code: "CONFLICT",
					message:
						"Você já possui um turno em andamento. Encerre-o antes de iniciar um novo.",
				});
			}

			const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

			// Cria o registro de turno
			const [log] = await db
				.insert(schema.scholarShiftLog)
				.values({
					id: uuidv7(),
					scholarProfileId: profile.id,
					date: today,
					shift: input.shift,
					startedAt: new Date(),
				})
				.returning();

			// Torna o bolsista disponível automaticamente ao iniciar o turno
			if (!profile.isAvailable) {
				await db
					.update(schema.scholarProfile)
					.set({ isAvailable: true, updatedAt: new Date() })
					.where(eq(schema.scholarProfile.id, profile.id));
			}

			return log;
		}),

	/**
	 * Encerra o turno do bolsista.
	 *
	 * Preenche o endedAt do registro de turno ativo.
	 * Define isAvailable como false automaticamente.
	 * Não permite editar turno de bolsistas inativos/desabilitados.
	 */
	endShift: scholarProcedure
		.input(EndShiftLogSchema)
		.mutation(async ({ ctx, input }) => {
			const profile = await db.query.scholarProfile.findFirst({
				where: eq(schema.scholarProfile.userId, ctx.session.user.id),
			});

			if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

			// Verifica se o bolsista está ativo
			if (!profile.isActive) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"Bolsista inativo não pode encerrar turno. Contate o gestor.",
				});
			}

			// Busca o registro de turno
			const log = await db.query.scholarShiftLog.findFirst({
				where: and(
					eq(schema.scholarShiftLog.id, input.shiftLogId),
					eq(schema.scholarShiftLog.scholarProfileId, profile.id),
				),
			});

			if (!log) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			if (log.endedAt) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Este turno já foi encerrado.",
				});
			}

			// Encerra o turno
			const [updated] = await db
				.update(schema.scholarShiftLog)
				.set({ endedAt: new Date(), updatedAt: new Date() })
				.where(eq(schema.scholarShiftLog.id, input.shiftLogId))
				.returning();

			// Torna o bolsista indisponível ao encerrar o turno
			await db
				.update(schema.scholarProfile)
				.set({ isAvailable: false, updatedAt: new Date() })
				.where(eq(schema.scholarProfile.id, profile.id));

			return updated;
		}),

	/**
	 * Retorna o turno ativo do bolsista autenticado, se houver.
	 */
	getActiveShift: scholarProcedure.query(async ({ ctx }) => {
		const profile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

		const activeLog = await db.query.scholarShiftLog.findFirst({
			where: and(
				eq(schema.scholarShiftLog.scholarProfileId, profile.id),
				isNull(schema.scholarShiftLog.endedAt),
			),
		});

		return activeLog ?? null;
	}),

	/**
	 * Retorna o histórico de turnos do bolsista autenticado.
	 */
	getHistory: scholarProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(30),
					offset: z.number().min(0).default(0),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const profile = await db.query.scholarProfile.findFirst({
				where: eq(schema.scholarProfile.userId, ctx.session.user.id),
			});

			if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

			const logs = await db.query.scholarShiftLog.findMany({
				where: eq(schema.scholarShiftLog.scholarProfileId, profile.id),
				orderBy: (t, { desc }) => [desc(t.startedAt)],
				limit: input?.limit,
				offset: input?.offset,
			});

			return logs;
		}),
});
