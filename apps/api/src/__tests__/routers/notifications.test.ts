/**
 * Testes unitários para o router de notifications.
 *
 * Cenários:
 * - list: retorno, apenas não lidas
 * - markRead: uma, todas
 * - unreadCount: retorna contagem
 */

import { appRouter } from "../../router";
import { seedNotification, seedUser } from "../helpers/seed";
import { createMockTRPCContext, createStudentSession } from "../mocks/context";

let caller: ReturnType<typeof appRouter.createCaller>;

describe("notificationsRouter", () => {
	beforeEach(async () => {
		// no-op: transactions not supported with neon-http
		caller = appRouter.createCaller(() => createMockTRPCContext());
	});

	// ─── list ───────────────────────────────────────────────────────────────────

	describe("list", () => {
		it("deve listar notificações do usuário", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			await seedNotification(user.id, { title: "Notificação 1" });
			await seedNotification(user.id, { title: "Notificação 2" });
			await seedNotification(user.id, { title: "Notificação 3" });
			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.notifications.list({
				limit: 30,
			});

			// Assert
			expect(result).toHaveLength(3);
		});

		it("deve filtrar apenas não lidas quando onlyUnread é true", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			await seedNotification(user.id, {
				title: "Lida",
				readAt: new Date(),
			});
			await seedNotification(user.id, {
				title: "Não lida 1",
				readAt: null,
			});
			await seedNotification(user.id, {
				title: "Não lida 2",
				readAt: null,
			});
			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.notifications.list({
				onlyUnread: true,
				limit: 30,
			});

			// Assert
			expect(result).toHaveLength(2);
			expect(
				result.every((n: { readAt: Date | null }) => n.readAt === null),
			).toBe(true);
		});

		it("deve respeitar limite de resultados", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			for (let i = 0; i < 10; i++) {
				await seedNotification(user.id, { title: `Notificação ${i}` });
			}
			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.notifications.list({
				limit: 5,
			});

			// Assert
			expect(result).toHaveLength(5);
		});
	});

	// ─── markRead ───────────────────────────────────────────────────────────────

	describe("markRead", () => {
		it("deve marcar uma notificação como lida", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			const notification = await seedNotification(user.id, {
				readAt: null,
			});
			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.notifications.markRead({
				notificationId: notification.id,
			});

			// Assert
			expect(result).toEqual({ success: true });
		});

		it("deve marcar todas as notificações como lidas", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			await seedNotification(user.id, { readAt: null });
			await seedNotification(user.id, { readAt: null });
			await seedNotification(user.id, { readAt: null });
			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.notifications.markRead({});

			// Assert
			expect(result).toEqual({ success: true });
		});
	});

	// ─── unreadCount ────────────────────────────────────────────────────────────

	describe("unreadCount", () => {
		it("deve retornar contagem de não lidas", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			await seedNotification(user.id, { readAt: null });
			await seedNotification(user.id, { readAt: null });
			await seedNotification(user.id, { readAt: new Date() }); // lida
			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.notifications.unreadCount();

			// Assert
			expect(result).toEqual({ count: 2 });
		});

		it("deve retornar count 0 quando não há não lidas", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			await seedNotification(user.id, { readAt: new Date() });
			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.notifications.unreadCount();

			// Assert
			expect(result).toEqual({ count: 0 });
		});
	});
});
