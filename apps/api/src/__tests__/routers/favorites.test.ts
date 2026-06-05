import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from "@jest/globals";

import { appRouter } from "../../../src/router";
import {
	seedCampusLocation,
	seedStudentProfile,
	seedUser,
} from "../helpers/seed";
import { createMockTRPCContext, createStudentSession } from "../mocks/context";
import { rollbackTransaction } from "../setup";

let caller: ReturnType<typeof appRouter.createCaller>;

describe("favoritesRouter", () => {
	beforeEach(async () => {
		await rollbackTransaction();
		jest.clearAllMocks();
		caller = appRouter.createCaller(() => createMockTRPCContext());
	});

	afterEach(async () => {
		await rollbackTransaction();
	});

	describe("create", () => {
		it("deve criar uma rota favorita com sucesso", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			const _studentProfile = await seedStudentProfile(user.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();

			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.favorites.create({
				name: "Casa para IC",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});

			// Assert
			expect(result).toMatchObject({
				name: "Casa para IC",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
		});

		it("deve falhar se estudante não tiver perfil", async () => {
			const user = await seedUser({ role: "student" });
			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			await expect(
				caller.favorites.create({
					name: "Rota",
					originLocationId: "1",
					destinationLocationId: "2",
				}),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("deve falhar se origem e destino forem iguais", async () => {
			const user = await seedUser({ role: "student" });
			await seedStudentProfile(user.id);
			const loc1 = await seedCampusLocation();

			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			await expect(
				caller.favorites.create({
					name: "Rota",
					originLocationId: loc1.id,
					destinationLocationId: loc1.id,
				}),
			).rejects.toMatchObject({ code: "BAD_REQUEST" });
		});

		it("deve falhar se já existir rota duplicada", async () => {
			const user = await seedUser({ role: "student" });
			await seedStudentProfile(user.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();

			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			await caller.favorites.create({
				name: "Rota 1",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});

			await expect(
				caller.favorites.create({
					name: "Rota 2",
					originLocationId: loc1.id,
					destinationLocationId: loc2.id,
				}),
			).rejects.toMatchObject({ code: "CONFLICT" });
		});

		it("deve falhar se atingir o limite de 10 rotas", async () => {
			const user = await seedUser({ role: "student" });
			await seedStudentProfile(user.id);
			const loc1 = await seedCampusLocation();

			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			for (let i = 0; i < 10; i++) {
				const locDest = await seedCampusLocation();
				await caller.favorites.create({
					name: `Rota ${i}`,
					originLocationId: loc1.id,
					destinationLocationId: locDest.id,
				});
			}

			const locDestExtra = await seedCampusLocation();
			await expect(
				caller.favorites.create({
					name: "Rota Extra",
					originLocationId: loc1.id,
					destinationLocationId: locDestExtra.id,
				}),
			).rejects.toMatchObject({ code: "CONFLICT" });
		});
	});

	describe("list", () => {
		it("deve listar rotas favoritas do aluno", async () => {
			const user = await seedUser({ role: "student" });
			await seedStudentProfile(user.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();

			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			await caller.favorites.create({
				name: "Rota Teste",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});

			const list = await caller.favorites.list();
			expect(list).toHaveLength(1);
			expect(list[0]).toMatchObject({
				name: "Rota Teste",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			expect(list[0].originLocation).toBeDefined();
			expect(list[0].destinationLocation).toBeDefined();
		});

		it("deve retornar lista vazia se estudante não tiver perfil", async () => {
			const user = await seedUser({ role: "student" });
			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			const list = await caller.favorites.list();
			expect(list).toHaveLength(0);
		});
	});

	describe("delete", () => {
		it("deve deletar rota favorita com sucesso", async () => {
			const user = await seedUser({ role: "student" });
			await seedStudentProfile(user.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();

			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			const route = await caller.favorites.create({
				name: "Rota Teste",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});

			if (!route) throw new Error("Failed to create route");

			await caller.favorites.delete({ routeId: route.id });

			const list = await caller.favorites.list();
			expect(list).toHaveLength(0);
		});

		it("deve falhar se a rota não existir", async () => {
			const user = await seedUser({ role: "student" });
			await seedStudentProfile(user.id);

			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			await expect(
				caller.favorites.delete({ routeId: "inexistente" }),
			).rejects.toMatchObject({ code: "NOT_FOUND" });
		});

		it("deve falhar se deletar rota de outro estudante", async () => {
			const user1 = await seedUser({ role: "student" });
			await seedStudentProfile(user1.id);
			const user2 = await seedUser({ role: "student" });
			await seedStudentProfile(user2.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();

			const session1 = createStudentSession({ id: user1.id });
			const caller1 = appRouter.createCaller(() => session1);
			const route = await caller1.favorites.create({
				name: "Rota",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});

			const session2 = createStudentSession({ id: user2.id });
			const caller2 = appRouter.createCaller(() => session2);

			if (!route) throw new Error("Failed to create route");

			await expect(
				caller2.favorites.delete({ routeId: route.id }),
			).rejects.toMatchObject({ code: "NOT_FOUND" });
		});
	});
});
