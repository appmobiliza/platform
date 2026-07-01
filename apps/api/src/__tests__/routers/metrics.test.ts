/**
 * Testes unitários para o router de metrics.
 *
 * Cenários:
 * - summary: métricas agregadas, período vazio
 * - byOriginLocation: distribuição por local
 * - scholarPerformance: performance por bolsista
 * - student tenta acessar (deve falhar)
 */

import { appRouter } from "../../router";
import {
	seedCampusLocation,
	seedScholarProfile,
	seedServiceAttendance,
	seedServiceRequest,
	seedStudentProfile,
	seedUser,
} from "../helpers/seed";
import {
	createManagerSession,
	createMockTRPCContext,
	createStudentSession,
} from "../mocks/context";

let caller: ReturnType<typeof appRouter.createCaller>;

describe("metricsRouter", () => {
	beforeEach(async () => {
		// no-op: transactions not supported with neon-http
		caller = appRouter.createCaller(() => createMockTRPCContext());
	});

	// Helper para criar range de datas
	const dateRange = () => ({
		from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		to: new Date().toISOString(),
	});

	describe("exportCSV", () => {
		it("deve retornar CSV com relatório de atendimentos", async () => {
			// Arrange
			await seedUser({ id: "manager-user-id", role: "manager" });
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({
				role: "scholar",
				email: "scholar_export@test.com",
			});
			const studentProfile = await seedStudentProfile(student.id);
			const scholarProfile = await seedScholarProfile(scholar.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();

			const request1 = await seedServiceRequest(studentProfile.id, {
				status: "completed",
				createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});

			await seedServiceAttendance(request1.id, scholarProfile.id, {
				startedAt: new Date(
					Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000,
				), // 5 min depois
				completedAt: new Date(
					Date.now() - 2 * 24 * 60 * 60 * 1000 + 900000,
				), // 15 min depois
				durationSeconds: 600,
				rating: 5,
			});

			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.metrics.exportCSV({});

			// Assert
			expect(typeof result).toBe("string");
			expect(result).toContain("ID Atendimento,Data da Solicitação");
			expect(result).toContain("600");
			expect(result).toContain("5");
		});
	});

	// ─── summary ────────────────────────────────────────────────────────────────

	describe("summary", () => {
		it("deve retornar métricas agregadas no período", async () => {
			// Arrange
			await seedUser({ id: "manager-user-id", role: "manager" });
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			const scholarProfile = await seedScholarProfile(scholar.id);
			const _loc1 = await seedCampusLocation();
			const _loc2 = await seedCampusLocation();

			const request1 = await seedServiceRequest(studentProfile.id, {
				status: "completed",
				createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
			});
			const _request2 = await seedServiceRequest(studentProfile.id, {
				status: "cancelled",
				createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
			});
			const request3 = await seedServiceRequest(studentProfile.id, {
				status: "completed",
				createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
			});

			await seedServiceAttendance(request1.id, scholarProfile.id, {
				createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
				acceptedAt: new Date(),
				startedAt: new Date(),
				completedAt: new Date(),
				rating: 5,
				durationSeconds: 300,
			});
			await seedServiceAttendance(request3.id, scholarProfile.id, {
				createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
				acceptedAt: new Date(),
				startedAt: new Date(),
				completedAt: new Date(),
				rating: 4,
				durationSeconds: 450,
			});

			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.metrics.summary(dateRange());

			// Assert
			expect(result.totalRequests).toBe(3);
			expect(result.completedRequests).toBe(2);
			expect(result.cancelledRequests).toBe(1);
			expect(result.completionRate).toBeCloseTo(0.667, 2);
		});

		it("deve retornar métricas vazias quando não há dados no período", async () => {
			// Arrange
			await seedUser({ role: "manager" });
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.metrics.summary(dateRange());

			// Assert
			expect(result.totalRequests).toBe(0);
			expect(result.completedRequests).toBe(0);
			expect(result.cancelledRequests).toBe(0);
			expect(result.completionRate).toBe(0);
		});
	});

	// ─── byOriginLocation ─────────────────────────────────────────────────────

	describe("byOriginLocation", () => {
		it("deve retornar distribuição por local de origem", async () => {
			// Arrange
			await seedUser({ id: "manager-user-id", role: "manager" });
			const student = await seedUser({ role: "student" });
			const studentProfile = await seedStudentProfile(student.id);
			const loc1 = await seedCampusLocation({
				name: "Bloco A",
				abbreviation: "BA",
			});
			const loc2 = await seedCampusLocation({
				name: "Bloco B",
				abbreviation: "BB",
			});
			await seedCampusLocation({
				name: "Biblioteca",
				abbreviation: "BIB",
			});

			await seedServiceRequest(studentProfile.id, {
				originLocationId: loc1.id,
				status: "completed",
				createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
			});
			await seedServiceRequest(studentProfile.id, {
				originLocationId: loc1.id,
				status: "completed",
				createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
			});
			await seedServiceRequest(studentProfile.id, {
				originLocationId: loc2.id,
				status: "completed",
				createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
			});

			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.metrics.byOriginLocation(dateRange());

			// Assert
			expect(result).toHaveLength(2); // only locations with requests
			expect(result[0]).toMatchObject({
				locationName: "Bloco A",
				requestCount: 2,
			});
		});
	});

	// ─── scholarPerformance ────────────────────────────────────────────────────

	describe("scholarPerformance", () => {
		it("deve retornar performance dos bolsistas", async () => {
			// Arrange
			await seedUser({ id: "manager-user-id", role: "manager" });
			const student = await seedUser({ role: "student" });
			const scholar1 = await seedUser({
				role: "scholar",
				email: "scholar1@test.com",
			});
			const scholar2 = await seedUser({
				role: "scholar",
				email: "scholar2@test.com",
			});
			const studentProfile = await seedStudentProfile(student.id);
			const scholarProfile1 = await seedScholarProfile(scholar1.id);
			const scholarProfile2 = await seedScholarProfile(scholar2.id);
			await seedCampusLocation();
			await seedCampusLocation();

			const request1 = await seedServiceRequest(studentProfile.id, {
				status: "completed",
				createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
			});
			const request2 = await seedServiceRequest(studentProfile.id, {
				status: "completed",
				createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
			});

			await seedServiceAttendance(request1.id, scholarProfile1.id, {
				createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
				acceptedAt: new Date(),
				startedAt: new Date(),
				completedAt: new Date(),
				rating: 5,
				durationSeconds: 300,
			});
			await seedServiceAttendance(request2.id, scholarProfile2.id, {
				createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
				acceptedAt: new Date(),
				startedAt: new Date(),
				completedAt: new Date(),
				rating: 4,
				durationSeconds: 400,
			});

			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.metrics.scholarPerformance(dateRange());

			// Assert
			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject({
				scholarProfileId: expect.any(String),
				totalAttendances: 1,
			});
		});
	});

	// ─── acesso não autorizado ──────────────────────────────────────────────────

	describe("acesso", () => {
		it("deve negar acesso a student para summary", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.metrics.summary(dateRange()),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("deve negar acesso a student para byOriginLocation", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.metrics.byOriginLocation(dateRange()),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("deve negar acesso a student para scholarPerformance", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.metrics.scholarPerformance(dateRange()),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});
	});
});
