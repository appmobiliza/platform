/**
 * Router de notificações.
 *
 * Notificações são criadas internamente pelos outros routers
 * (ex.: quando uma solicitação é aceita). Este router expõe
 * apenas leitura e marcação de lidas para o cliente.
 */

import { db } from "@mobiliza/db/client";
import { and, desc, eq, isNull } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure, router } from "@mobiliza/trpc";

import { z } from "zod";

export const notificationsRouter = router({
	/**
	 * Notificações do usuário autenticado, mais recentes primeiro.
	 */
	list: protectedProcedure
		.input(
			z.object({
				onlyUnread: z.boolean().default(false),
				limit: z.number().int().min(1).max(50).default(30),
			}),
		)

		.query(async ({ ctx, input }) => {
			const conditions = [
				eq(schema.notification.userId, ctx.session.user.id),
				...(input.onlyUnread
					? [isNull(schema.notification.readAt)]
					: []),
			];

			return db.query.notification.findMany({
				where: and(...conditions),
				orderBy: [desc(schema.notification.createdAt)],
				limit: input.limit,
			});
		}),

	/**
	 * Marca uma ou todas as notificações como lidas.
	 */
	markRead: protectedProcedure
		.input(
			z.object({
				/** Omitir `id` para marcar todas como lidas */
				notificationId: z.string().optional(),
			}),
		)

		.mutation(async ({ ctx, input }) => {
			const now = new Date();

			if (input.notificationId) {
				await db
					.update(schema.notification)
					.set({ readAt: now })
					.where(
						and(
							eq(schema.notification.id, input.notificationId),
							eq(schema.notification.userId, ctx.session.user.id),
						),
					);
			} else {
				// Marca todas as não lidas do usuário
				await db
					.update(schema.notification)
					.set({ readAt: now })
					.where(
						and(
							eq(schema.notification.userId, ctx.session.user.id),
							isNull(schema.notification.readAt),
						),
					);
			}

			return { success: true };
		}),

	/**
	 * Contagem de não lidas — útil para o badge no app.
	 */
	unreadCount: protectedProcedure
		.query(async ({ ctx }) => {
			const items = await db.query.notification.findMany({
				where: and(
					eq(schema.notification.userId, ctx.session.user.id),
					isNull(schema.notification.readAt),
				),
				columns: { id: true },
			});

			return { count: items.length };
		}),
});
