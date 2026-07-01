/**
 * Testes unitários para o router de locations.
 *
 * Cenários:
 * - list: público sem auth
 * - listAll: manager acessa, student não acessa
 * - create: manager cria, student tenta (deve falhar)
 * - setActive: manager ativa/desativa
 */

import { appRouter } from "../../router";
import { seedCampusLocation, seedUser } from "../helpers/seed";
import {
	createManagerSession,
	createMockTRPCContext,
	createNullSessionContext,
	createStudentSession,
} from "../mocks/context";

let caller: ReturnType<typeof appRouter.createCaller>;

describe("locationsRouter", () => {
	beforeEach(async () => {
		caller = appRouter.createCaller(() => createMockTRPCContext());
	});

	// ─── list ───────────────────────────────────────────────────────────────────

	describe("list", () => {
		it("deve listar locais ativos sem autenticação", async () => {
			// Arrange
			await seedCampusLocation({
				name: "Biblioteca Central",
				abbreviation: "BC",
				isActive: true,
			});
			await seedCampusLocation({
				name: "RU",
				abbreviation: "RU",
				isActive: true,
			});
			await seedCampusLocation({
				name: "Antigo RU",
				abbreviation: "ARU",
				isActive: false,
			});
			const session = createNullSessionContext();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.locations.list();

			// Assert
			expect(result).toHaveLength(2);
			expect(result.every((l: { isActive: boolean }) => l.isActive)).toBe(
				true,
			);
		});

		it("deve retornar lista vazia quando não há locais", async () => {
			// Arrange
			const session = createNullSessionContext();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.locations.list();

			// Assert
			expect(result).toEqual([]);
		});
	});

	// ─── listAll ───────────────────────────────────────────────────────────────

	describe("listAll", () => {
		it("deve permitir manager acessar todos os locais", async () => {
			// Arrange
			await seedUser({ role: "manager" });
			await seedCampusLocation({ name: "Ativo", isActive: true });
			await seedCampusLocation({ name: "Inativo", isActive: false });
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.locations.listAll();

			// Assert
			expect(result).toHaveLength(2);
		});

		it("deve negar acesso a student para listAll", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			await seedCampusLocation({ name: "Test", isActive: true });
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(caller.locations.listAll()).rejects.toMatchObject({
				code: "FORBIDDEN",
			});
		});
	});

	// ─── create ─────────────────────────────────────────────────────────────────

	describe("create", () => {
		it("deve criar local com sucesso sendo manager", async () => {
			// Arrange
			await seedUser({ role: "manager" });
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.locations.create({
				name: "Novo Prédio",
				abbreviation: "NP",
				description: "Prédio novo do curso",
				latitude: -9.0,
				longitude: -35.7,
			});

			// Assert
			expect(result).toMatchObject({
				name: "Novo Prédio",
				abbreviation: "NP",
			});
		});

		it("deve falhar quando student tenta criar local", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.locations.create({
					name: "Ilegal",
					abbreviation: "IL",
					latitude: -9.0,
					longitude: -35.7,
				}),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});
	});

	// ─── setActive ──────────────────────────────────────────────────────────────

	describe("setActive", () => {
		it("deve ativar local com sucesso", async () => {
			// Arrange
			await seedUser({ role: "manager" });
			const location = await seedCampusLocation({
				name: "Test",
				isActive: false,
			});
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.locations.setActive({
				id: location.id,
				isActive: true,
			});

			// Assert
			expect(result).toMatchObject({ isActive: true });
		});

		it("deve desativar local com sucesso", async () => {
			// Arrange
			await seedUser({ role: "manager" });
			const location = await seedCampusLocation({
				name: "Test",
				isActive: true,
			});
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.locations.setActive({
				id: location.id,
				isActive: false,
			});

			// Assert
			expect(result).toMatchObject({ isActive: false });
		});
	});
});
