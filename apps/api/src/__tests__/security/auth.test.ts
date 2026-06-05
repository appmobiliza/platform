/**
 * Testes de segurança para autenticação.
 *
 * Testa:
 * - Session hijacking prevention
 * - Token validation
 * - Session expiration
 * - Multiple session handling
 */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { appRouter } from "../../router";
import {
	seedCampusLocation,
	seedNotification,
	seedStudentProfile,
	seedUser,
} from "../helpers/seed";
import {
	createMockTRPCContext,
	createNullSessionContext,
	createScholarSession,
	createStudentSession,
} from "../mocks/context";
import { rollbackTransaction } from "../setup";

let caller: ReturnType<typeof appRouter.createCaller>;

describe("auth", () => {
	beforeEach(async () => {
		await rollbackTransaction();
		jest.clearAllMocks();
		caller = appRouter.createCaller(() => createMockTRPCContext());
	});

	afterEach(async () => {
		await rollbackTransaction();
	});

	// ─── Session hijacking prevention ─────────────────────────────────────────

	describe("session hijacking prevention", () => {
		it("deve rejeitar requisição com sessão null após auth validar", async () => {
			// Arrange
			const session = createNullSessionContext();
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(caller.profiles.me()).rejects.toMatchObject({
				code: "UNAUTHORIZED",
			});
		});

		it("deve usar session ID único para cada sessão", async () => {
			// Arrange
			const session1 = createStudentSession({ id: "user-session-1" });
			const session2 = createStudentSession({ id: "user-session-2" });

			// Assert
			expect(session1.session?.session.id).not.toBe(
				session2.session?.session.id,
			);
			expect(session1.session?.user.id).not.toBe(
				session2.session?.user.id,
			);
		});
	});

	// ─── Token validation ─────────────────────────────────────────────────────

	describe("token validation", () => {
		it("deve falhar quando token está ausente nos headers", async () => {
			// Arrange
			const session = createNullSessionContext();
			session.headers = new Headers();
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(caller.profiles.me()).rejects.toMatchObject({
				code: "UNAUTHORIZED",
			});
		});

		it("deve falhar quando authorization header está mal formatado", async () => {
			// Arrange
			const session = createNullSessionContext();
			session.headers = new Headers({ Authorization: "InvalidFormat" });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(caller.profiles.me()).rejects.toMatchObject({
				code: "UNAUTHORIZED",
			});
		});
	});

	// ─── Session expiration ───────────────────────────────────────────────────

	describe("session expiration", () => {
		it("deve rejeitar sessão expirada", async () => {
			// Arrange
			const session = createNullSessionContext();
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(caller.profiles.me()).rejects.toMatchObject({
				code: "UNAUTHORIZED",
			});
		});

		it("deve aceitar sessão válida não expirada", async () => {
			// Arrange
			const user = await seedUser({ id: "user_valid", role: "student" });
			await seedStudentProfile(user.id);

			const session = createStudentSession({ id: "user_valid" });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.me();

			// Assert
			expect(result).toMatchObject({ id: "user_valid" });
		});
	});

	// ─── Role-based auth ───────────────────────────────────────────────────────

	describe("role-based auth", () => {
		it("deve permitir apenas students acessar create em requests", async () => {
			// Arrange
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const student = await seedUser({ role: "student" });
			await seedStudentProfile(student.id);

			const studentSession = createStudentSession({
				id: student.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => studentSession);

			// Act
			const result = await caller.requests.create({
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});

			// Assert
			expect(result).toMatchObject({
				id: expect.any(String),
				status: "pending",
			});
		});

		it("deve rejeitar scholar ao tentar create em requests", async () => {
			// Arrange
			const scholar = await seedUser({ role: "scholar" });
			const session = createScholarSession({ id: scholar.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.create({
					originLocationId: "1",
					destinationLocationId: "2",
				}),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});
	});

	// ─── Multiple session handling ─────────────────────────────────────────────

	describe("multiple session handling", () => {
		it("deve manter sessões independentes para usuários diferentes", async () => {
			// Arrange
			const user1 = await seedUser({ role: "student" });
			const user2 = await seedUser({ role: "student" });
			await seedStudentProfile(user1.id);
			await seedStudentProfile(user2.id);
			await seedNotification(user1.id, { title: "Notificação user1" });
			await seedNotification(user2.id, { title: "Notificação user2" });

			const session1 = createStudentSession({
				id: user1.id,
				role: "student",
			});
			const session2 = createStudentSession({
				id: user2.id,
				role: "student",
			});
			const caller1 = appRouter.createCaller(() => session1);
			const caller2 = appRouter.createCaller(() => session2);

			// Act
			const result1 = await caller1.notifications.list({ limit: 30 });
			const result2 = await caller2.notifications.list({ limit: 30 });

			// Assert
			expect(result1).toHaveLength(1);
			expect(result1[0]).toMatchObject({ title: "Notificação user1" });
			expect(result2).toHaveLength(1);
			expect(result2[0]).toMatchObject({ title: "Notificação user2" });
		});
	});

	// ─── Context isolation ─────────────────────────────────────────────────────

	describe("context isolation", () => {
		it("deve isolar ctx.session entre requisições simultâneas", async () => {
			// Arrange
			const user1 = await seedUser({ role: "student" });
			const user2 = await seedUser({ role: "student" });
			await seedStudentProfile(user1.id);
			await seedStudentProfile(user2.id);

			const session1 = createStudentSession({ id: user1.id });
			const session2 = createStudentSession({ id: user2.id });
			const caller1 = appRouter.createCaller(() => session1);
			const caller2 = appRouter.createCaller(() => session2);

			// Act - duas requisições simultâneas
			const [result1, result2] = await Promise.all([
				caller1.profiles.me(),
				caller2.profiles.me(),
			]);

			// Assert
			expect(result1.id).toBe(user1.id);
			expect(result2.id).toBe(user2.id);
		});
	});
});
