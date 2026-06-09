import { protectedProcedure } from "@mobiliza/trpc";

import { z } from "zod";

/**
 * Atualiza a posição em tempo real do usuário e a transmite para os
 * canais apropriados via realtime.
 *
 * - **Bolsista (scholar)**: publica sempre em `scholar:positions` (visível
 *   para estudantes durante a busca) e, se `requestId` for fornecido,
 *   também publica em `request:{requestId}` (visível para o estudante
 *   durante o deslocamento).
 * - **Estudante (student)**: publica em `request:{requestId}` apenas
 *   durante um deslocamento ativo (para que o bolsista veja sua posição).
 */
export const updatePosition = protectedProcedure
	.input(
		z.object({
			latitude: z.number().min(-90).max(90),
			longitude: z.number().min(-180).max(180),
			heading: z.number().min(0).max(360).optional(),
			/** ID da solicitação ativa — necessário para visibilidade entre as partes */
			requestId: z.string().optional(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		try {
			if (userRole === "scholar") {
				// 1. Posição geral do bolsista — visível para estudantes em busca
				await ctx.realtime.publish("scholar:positions", "position", {
					scholarId: userId,
					latitude: input.latitude,
					longitude: input.longitude,
					heading: input.heading,
				});

				// 2. Posição no canal da solicitação — visível para o estudante atendido
				if (input.requestId) {
					await ctx.realtime.publish(
						`request:${input.requestId}`,
						"request:position",
						{
							scholarId: userId,
							latitude: input.latitude,
							longitude: input.longitude,
							heading: input.heading,
						},
					);
				}
			} else if (userRole === "student" && input.requestId) {
				// Estudante publica posição durante deslocamento ativo
				await ctx.realtime.publish(
					`request:${input.requestId}`,
					"student:position",
					{
						studentId: userId,
						latitude: input.latitude,
						longitude: input.longitude,
						heading: input.heading,
					},
				);
			}
		} catch (error) {
			console.error(
				"[Realtime] Failed to publish position update:",
				error,
			);
		}

		return { success: true };
	});
