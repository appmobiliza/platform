/**
 * Testes unitários para o router de profiles.
 *
 * Cenários:
 * - me: retorno de usuário + perfis
 * - createStudent: idempotente, criação, validação
 * - createScholar: criação pendente
 * - toggleAvailability: alternar, não aprovado
 * - pendingScholars: lista vazia/com dados
 * - reviewScholar: aprovação/rejeição
 */

import { appRouter } from "../../router";
import { rollbackTransaction } from "../db-setup";
import {
	seedScholarProfile,
	seedStudentProfile,
	seedUser,
} from "../helpers/seed";
import {
	createManagerSession,
	createMockTRPCContext,
	createScholarSession,
	createStudentSession,
} from "../mocks/context";

let caller: ReturnType<typeof appRouter.createCaller>;

describe("profilesRouter", () => {
	beforeEach(async () => {
		// no-op: transactions not supported with neon-http
		caller = appRouter.createCaller(() => createMockTRPCContext());
	});

	afterEach(async () => {
		await rollbackTransaction();
	});

	// ─── me ─────────────────────────────────────────────────────────────────────

	describe("me", () => {
		it("deve retornar usuário com perfis", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			await seedStudentProfile(user.id);
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.me();

			// Assert
			expect(result).toMatchObject({
				id: user.id,
				email: user.email,
				studentProfile: expect.objectContaining({ userId: user.id }),
			});
		});

		it("deve retornar usuário com perfil de bolsista", async () => {
			// Arrange
			const user = await seedUser({ role: "scholar" });
			await seedScholarProfile(user.id, { isApproved: true });
			const session = createScholarSession({
				id: user.id,
				role: "scholar",
			});
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.me();

			// Assert
			expect(result).toMatchObject({
				id: user.id,
				scholarProfile: expect.objectContaining({ userId: user.id }),
			});
		});
	});

	// ─── createStudent ──────────────────────────────────────────────────────────

	describe("createStudent", () => {
		it("deve ser idempotente retornando perfil existente", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			const existingProfile = await seedStudentProfile(user.id);
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.createStudent({
				enrollment: "2024001",
				course: "Ciência da Computação",
				campus: "Campus A.C. Simões",
				phone: "82111112222",
				shift: "morning",
				gender: "male",
				disabilityTypes: ["physical_disability"],
			});

			// Assert
			expect(result.id).toBe(existingProfile.id);
		});

		it("deve criar perfil de estudante com sucesso", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.createStudent({
				enrollment: "2024003",
				course: "Ciência da Computação",
				campus: "Campus A.C. Simões",
				phone: "82111119999",
				shift: "morning",
				gender: "female",
				disabilityTypes: ["blindness"],
				attendanceNotes: "Precisa de sala de aula no térreo",
			});

			// Assert
			expect(result).toMatchObject({
				userId: user.id,
				enrollment: "2024003",
				course: "Ciência da Computação",
			});
		});

		it("deve falhar com phone inválido (menos de 10 dígitos)", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.profiles.createStudent({
					enrollment: "2024004",
					course: "Ciência da Computação",
					campus: "Campus A.C. Simões",
					phone: "12345", // apenas 5 dígitos
					shift: "morning",
					gender: "male",
					disabilityTypes: ["physical_disability"],
				}),
			).rejects.toThrow();
		});

		it("deve falhar com phone inválido (mais de 11 dígitos)", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.profiles.createStudent({
					enrollment: "2024005",
					course: "Ciência da Computação",
					campus: "Campus A.C. Simões",
					phone: "821111122221", // 12 dígitos
					shift: "morning",
					gender: "male",
					disabilityTypes: ["physical_disability"],
				}),
			).rejects.toThrow();
		});

		it("deve falhar sem disabilityTypes", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.profiles.createStudent({
					enrollment: "2024006",
					course: "Ciência da Computação",
					campus: "Campus A.C. Simões",
					phone: "82111116666",
					shift: "morning",
					gender: "male",
					disabilityTypes: [],
				}),
			).rejects.toThrow();
		});
	});

	// ─── createScholar ──────────────────────────────────────────────────────────

	describe("createScholar", () => {
		it("deve criar perfil de bolsista pendente de aprovação", async () => {
			// Arrange
			const user = await seedUser({ role: "scholar" });
			const session = createScholarSession({
				id: user.id,
				role: "scholar",
			});
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.createScholar({
				enrollment: "2024007",
				course: "Ciência da Computação",
				campus: "Campus A.C. Simões",
				shift: "morning",
				phone: "82111117777",
				cpf: "12345678901",
			});

			// Assert
			expect(result).toMatchObject({
				userId: user.id,
				enrollment: "2024007",
				isApproved: false,
				isAvailable: false,
			});
		});

		it("deve ser idempotente retornando perfil existente", async () => {
			// Arrange
			const user = await seedUser({ role: "scholar" });
			const existingProfile = await seedScholarProfile(user.id, {
				isApproved: false,
			});
			const session = createScholarSession({
				id: user.id,
				role: "scholar",
			});
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.createScholar({
				enrollment: "2024008",
				course: "Ciência da Computação",
				campus: "Campus A.C. Simões",
				shift: "morning",
				phone: "82111118888",
				cpf: "98765432109",
			});

			// Assert
			expect(result.id).toBe(existingProfile.id);
		});
	});

	// ─── toggleAvailability ─────────────────────────────────────────────────────

	describe("toggleAvailability", () => {
		it("deve alternar disponibilidade do bolsista", async () => {
			// Arrange
			const user = await seedUser({ role: "scholar" });
			await seedScholarProfile(user.id, {
				isApproved: true,
				isAvailable: false,
			});
			const session = createScholarSession({
				id: user.id,
				role: "scholar",
			});
			caller = appRouter.createCaller(() => session);

			// Act - primeiro toggle (false -> true)
			const result1 = await caller.profiles.toggleAvailability();

			// Assert
			expect(result1.isAvailable).toBe(true);

			// Act - segundo toggle (true -> false)
			const result2 = await caller.profiles.toggleAvailability();

			// Assert
			expect(result2.isAvailable).toBe(false);
		});

		it("deve falhar quando bolsista não está aprovado", async () => {
			// Arrange
			const user = await seedUser({ role: "scholar" });
			await seedScholarProfile(user.id, {
				isApproved: false,
				isAvailable: false,
			});
			const session = createScholarSession({
				id: user.id,
				role: "scholar",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.profiles.toggleAvailability(),
			).rejects.toMatchObject({
				code: "FORBIDDEN",
				message: expect.stringContaining("aprovado"),
			});
		});
	});

	// ─── pendingScholars ─────────────────────────────────────────────────────────

	describe("pendingScholars", () => {
		it("deve retornar lista vazia quando não há pendências", async () => {
			// Arrange
			await seedUser({ role: "manager" });
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.pendingScholars();

			// Assert
			expect(result).toEqual([]);
		});

		it("deve retornar lista de bolsistas pendentes", async () => {
			// Arrange
			await seedUser({ role: "manager" });
			const scholar = await seedUser({ role: "scholar" });
			await seedScholarProfile(scholar.id, { isApproved: false });
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.pendingScholars();

			// Assert
			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject({
				id: expect.any(String),
				isApproved: false,
			});
		});
	});

	// ─── reviewScholar ──────────────────────────────────────────────────────────

	describe("reviewScholar", () => {
		it("deve aprovar bolsista com sucesso", async () => {
			// Arrange
			await seedUser({ id: "manager-user-id", role: "manager" });
			const scholar = await seedUser({ role: "scholar" });
			const scholarProfile = await seedScholarProfile(scholar.id, {
				isApproved: false,
			});
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.reviewScholar({
				scholarProfileId: scholarProfile.id,
				approved: true,
			});

			// Assert
			expect(result).toMatchObject({
				isApproved: true,
				isActive: true,
				approvedAt: expect.any(Date),
			});
		});

		it("deve rejeitar bolsista com sucesso", async () => {
			// Arrange
			await seedUser({ role: "manager" });
			const scholar = await seedUser({ role: "scholar" });
			const scholarProfile = await seedScholarProfile(scholar.id, {
				isApproved: false,
			});
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.profiles.reviewScholar({
				scholarProfileId: scholarProfile.id,
				approved: false,
			});

			// Assert
			expect(result).toMatchObject({
				isApproved: false,
				isActive: false,
			});
		});

		it("deve falhar quando perfil não existe", async () => {
			// Arrange
			await seedUser({ role: "manager" });
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.profiles.reviewScholar({
					scholarProfileId: "non-existent-id",
					approved: true,
				}),
			).rejects.toMatchObject({ code: "NOT_FOUND" });
		});
	});
});
