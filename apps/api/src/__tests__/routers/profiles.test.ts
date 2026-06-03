/**
 * Testes unitários para o router de profiles.
 *
 * Cenários:
 * - me: retorno de usuário + perfis
 * - createStudent: idempotente, criação, validação
 * - createScholar: criação pendente
 * - toggleAvailability: alternar, não aprovado
 */

import { appRouter } from "../../router";
import { rollbackTransaction } from "../db-setup";
import {
	seedScholarProfile,
	seedStudentProfile,
	seedUser,
} from "../helpers/seed";
import {
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
			await seedScholarProfile(user.id);
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
				gender: "male",
			});

			// Assert
			expect(result).toMatchObject({
				userId: user.id,
				enrollment: "2024007",
				isAvailable: false,
			});
		});

		it("deve ser idempotente retornando perfil existente", async () => {
			// Arrange
			const user = await seedUser({ role: "scholar" });
			const existingProfile = await seedScholarProfile(user.id);
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
				gender: "male",
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
			await seedScholarProfile(user.id, { isAvailable: false });
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
});
