/**
 * Testes unitários para o router de requests.
 *
 * Cenários:
 * - create: estudante inativo, sem perfil, origem=destino, conflito
 * - create: sucesso
 * - cancel: não dono, já concluída, em andamento, sucesso
 * - accept: bolsista não aprovado, indisponível, race condition
 * - start: sem atendimento, sucesso
 * - complete: sem start, sucesso
 * - rate: não dono, sucesso
 * - myHistory: com/sem dados
 * - available: retorna pendentes
 */

import { TRPCError } from "@trpc/server";

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
	createMockTRPCContext,
	createScholarSession,
	createStudentSession,
} from "../mocks/context";

let caller: ReturnType<typeof appRouter.createCaller>;

describe("requestsRouter", () => {
	beforeEach(async () => {
		caller = appRouter.createCaller(() => createMockTRPCContext());
	});

	// ─── create ─────────────────────────────────────────────────────────────────

	describe("create", () => {
		it("deve falhar quando estudante não tem perfil cadastrado", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.create({
					originLocationId: "1",
					destinationLocationId: "2",
					notes: "Test note",
				}),
			).rejects.toThrow(TRPCError);
		});

		it("deve falhar quando estudante está inativo", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			await seedStudentProfile(user.id, { isActive: false });
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.create({
					originLocationId: "1",
					destinationLocationId: "2",
				}),
			).rejects.toMatchObject({
				code: "FORBIDDEN",
			});
		});

		it("deve falhar quando origem é igual ao destino", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			await seedStudentProfile(user.id);
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.create({
					originLocationId: "1",
					destinationLocationId: "1",
				}),
			).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: expect.stringContaining("mesmo local"),
			});
		});

		it("deve falhar quando estudante já tem solicitação ativa", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			const profile = await seedStudentProfile(user.id);
			await seedCampusLocation({ isActive: true });
			await seedCampusLocation({ isActive: true });
			await seedServiceRequest(profile.id, { status: "pending" });
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.create({
					originLocationId: "1",
					destinationLocationId: "2",
				}),
			).rejects.toMatchObject({
				code: "CONFLICT",
			});
		});

		it("deve criar solicitação com sucesso", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			await seedStudentProfile(user.id);
			const loc1 = await seedCampusLocation({ isActive: true });
			const loc2 = await seedCampusLocation({ isActive: true });
			const session = createStudentSession({
				id: user.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.create({
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
				notes: "Preciso de ayuda",
			});

			// Assert
			expect(result).toMatchObject({
				status: "pending",
				studentProfileId: expect.any(String),
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
		});
	});

	// ─── cancel ─────────────────────────────────────────────────────────────────

	describe("cancel", () => {
		it("deve falhar quando não é o dono da solicitação", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const otherStudent = await seedUser({
				role: "student",
				email: "other@test.com",
			});
			const profile = await seedStudentProfile(student.id);
			const _otherProfile = await seedStudentProfile(otherStudent.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(profile.id, {
				status: "pending",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			const session = createStudentSession({ id: otherStudent.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.cancel({
					requestId: request.id,
				}),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("deve falhar quando solicitação já foi concluída", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const profile = await seedStudentProfile(student.id);
			const scholarProfile = await seedScholarProfile(scholar.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(profile.id, {
				status: "completed",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			await seedServiceAttendance(request.id, scholarProfile.id, {
				completedAt: new Date(),
			});
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.cancel({
					requestId: request.id,
				}),
			).rejects.toMatchObject({ code: "BAD_REQUEST" });
		});

		it("deve cancelar solicitação em andamento", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const profile = await seedStudentProfile(student.id);
			const scholarProfile = await seedScholarProfile(scholar.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(profile.id, {
				status: "ongoing",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			await seedServiceAttendance(request.id, scholarProfile.id, {
				startedAt: new Date(),
			});
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.cancel({
				requestId: request.id,
			});

			// Assert
			expect(result).toMatchObject({
				status: "cancelled",
			});
		});

		it("deve cancelar solicitação com sucesso", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const profile = await seedStudentProfile(student.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(profile.id, {
				status: "pending",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.cancel({
				requestId: request.id,
			});

			// Assert
			expect(result).toMatchObject({
				status: "cancelled",
			});
		});
	});

	// ─── accept ─────────────────────────────────────────────────────────────────

	describe("accept", () => {
		it("deve falhar quando bolsista não está aprovado", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			await seedScholarProfile(scholar.id, { isAvailable: false });
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(studentProfile.id, {
				status: "pending",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			const session = createScholarSession({ id: scholar.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.accept({
					requestId: request.id,
				}),
			).rejects.toMatchObject({
				code: "FORBIDDEN",
				message: expect.stringContaining("aprovado"),
			});
		});

		it("deve falhar quando bolsista está indisponível", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			await seedScholarProfile(scholar.id, { isAvailable: false });
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(studentProfile.id, {
				status: "pending",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			const session = createScholarSession({ id: scholar.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.accept({
					requestId: request.id,
				}),
			).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: expect.stringContaining("indisponível"),
			});
		});

		it("deve falhar em race condition quando solicitação já foi aceita", async () => {
			// Arrange
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
			await seedScholarProfile(scholar1.id, { isAvailable: true });
			await seedScholarProfile(scholar2.id, { isAvailable: true });
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(studentProfile.id, {
				status: "pending",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			const session1 = createScholarSession({ id: scholar1.id });
			caller = appRouter.createCaller(() => session1);

			// First scholar accepts successfully
			await caller.requests.accept({
				requestId: request.id,
			});

			// Second scholar tries to accept same request
			const session2 = createScholarSession({ id: scholar2.id });
			caller = appRouter.createCaller(() => session2);
			await expect(
				caller.requests.accept({
					requestId: request.id,
				}),
			).rejects.toMatchObject({
				code: "NOT_FOUND",
				message: expect.stringContaining("outro bolsista"),
			});
		});

		it("deve aceitar solicitação com sucesso", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			const _scholarProfile = await seedScholarProfile(scholar.id, {
				isAvailable: true,
			});
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(studentProfile.id, {
				status: "pending",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			const session = createScholarSession({ id: scholar.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.accept({
				requestId: request.id,
			});

			// Assert
			expect(result).toMatchObject({
				request: expect.objectContaining({ status: "accepted" }),
				attendance: expect.objectContaining({ requestId: request.id }),
			});
		});
	});

	// ─── start ─────────────────────────────────────────────────────────────────

	describe("start", () => {
		it("deve falhar quando não existe atendimento para o request", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			await seedScholarProfile(scholar.id);
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(studentProfile.id, {
				status: "pending",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			const session = createScholarSession({ id: scholar.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.start({
					requestId: request.id,
				}),
			).rejects.toMatchObject({ code: "NOT_FOUND" });
		});

		it("deve iniciar atendimento com sucesso", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			const scholarProfile = await seedScholarProfile(scholar.id, {
				isAvailable: true,
			});
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(studentProfile.id, {
				status: "pending",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			await seedServiceAttendance(request.id, scholarProfile.id, {
				acceptedAt: new Date(),
			});
			const session = createScholarSession({ id: scholar.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.start({
				requestId: request.id,
			});

			// Assert
			expect(result).toEqual({ success: true });
		});
	});

	// ─── complete ───────────────────────────────────────────────────────────────

	describe("complete", () => {
		it("deve falhar quando atendimento não foi iniciado", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			const scholarProfile = await seedScholarProfile(scholar.id, {
				isAvailable: true,
			});
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(studentProfile.id, {
				status: "accepted",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			await seedServiceAttendance(request.id, scholarProfile.id, {
				acceptedAt: new Date(),
				startedAt: null,
			});
			const session = createScholarSession({ id: scholar.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.complete({
					requestId: request.id,
				}),
			).rejects.toMatchObject({
				code: "BAD_REQUEST",
				message: expect.stringContaining("iniciado"),
			});
		});

		it("deve completar atendimento com sucesso", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			const scholarProfile = await seedScholarProfile(scholar.id, {
				isAvailable: true,
			});
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(studentProfile.id, {
				status: "ongoing",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			const startedAt = new Date(Date.now() - 60000); // 1 minute ago
			await seedServiceAttendance(request.id, scholarProfile.id, {
				acceptedAt: new Date(Date.now() - 120000),
				startedAt,
			});
			const session = createScholarSession({ id: scholar.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.complete({
				requestId: request.id,
			});

			// Assert
			expect(result).toMatchObject({
				durationSeconds: expect.any(Number),
			});
		});
	});

	// ─── rate ───────────────────────────────────────────────────────────────────

	describe("rate", () => {
		it("deve falhar quando não é o dono da solicitação", async () => {
			// Arrange
			const student1 = await seedUser({
				role: "student",
				email: "student1@test.com",
			});
			const student2 = await seedUser({
				role: "student",
				email: "student2@test.com",
			});
			const scholar = await seedUser({ role: "scholar" });
			const profile1 = await seedStudentProfile(student1.id);
			await seedStudentProfile(student2.id);
			const scholarProfile = await seedScholarProfile(scholar.id, {
				isAvailable: true,
			});
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(profile1.id, {
				status: "completed",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			await seedServiceAttendance(request.id, scholarProfile.id, {
				acceptedAt: new Date(),
				startedAt: new Date(),
				completedAt: new Date(),
			});
			const session = createStudentSession({ id: student2.id });
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.rate({
					requestId: request.id,
					rating: 5,
				}),
			).rejects.toMatchObject({ code: "NOT_FOUND" });
		});

		it("deve avaliar atendimento com sucesso", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const profile = await seedStudentProfile(student.id);
			const scholarProfile = await seedScholarProfile(scholar.id, {
				isAvailable: true,
			});
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(profile.id, {
				status: "completed",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			await seedServiceAttendance(request.id, scholarProfile.id, {
				acceptedAt: new Date(),
				startedAt: new Date(),
				completedAt: new Date(),
			});
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.rate({
				requestId: request.id,
				rating: 5,
				comment: "Excelente atendimento!",
			});

			// Assert
			expect(result).toEqual({ success: true });
		});
	});

	// ─── myHistory ──────────────────────────────────────────────────────────────

	describe("myHistory", () => {
		it("deve retornar lista vazia quando não há dados", async () => {
			// Arrange
			const user = await seedUser({ role: "student" });
			const session = createStudentSession({ id: user.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.studentHistory({
				limit: 20,
			});

			// Assert
			expect(result).toEqual({ items: [], nextCursor: undefined });
		});

		it("deve retornar histórico do estudante", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const profile = await seedStudentProfile(student.id);
			const scholarProfile = await seedScholarProfile(scholar.id, {
				isAvailable: true,
			});
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(profile.id, {
				status: "completed",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
				createdAt: new Date(),
			});
			await seedServiceAttendance(request.id, scholarProfile.id);
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.studentHistory({
				limit: 20,
			});

			// Assert
			expect(result.items).toHaveLength(1);
			expect(result.items[0]).toMatchObject({
				id: request.id,
				status: "completed",
			});
		});
	});

	// ─── available ─────────────────────────────────────────────────────────────

	describe("available", () => {
		it("deve retornar solicitações pendentes", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			await seedScholarProfile(scholar.id, { isAvailable: true });
			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();
			const request = await seedServiceRequest(studentProfile.id, {
				status: "pending",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			const session = createScholarSession({ id: scholar.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.pending();

			// Assert
			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject({
				id: request.id,
				status: "pending",
			});
		});
	});

	// ─── scholarHistory ─────────────────────────────────────────────────────────────

	describe("scholarHistory", () => {
		it("deve retornar o histórico do bolsista com duração total", async () => {
			// Arrange
			const scholar = await seedUser({ role: "scholar" });
			const scholarProfile = await seedScholarProfile(scholar.id, {});
			const student = await seedUser({ role: "student" });
			const studentProfile = await seedStudentProfile(student.id);

			const loc1 = await seedCampusLocation();
			const loc2 = await seedCampusLocation();

			const request1 = await seedServiceRequest(studentProfile.id, {
				status: "completed",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});
			const request2 = await seedServiceRequest(studentProfile.id, {
				status: "completed",
				originLocationId: loc1.id,
				destinationLocationId: loc2.id,
			});

			await seedServiceAttendance(request1.id, scholarProfile.id, {
				durationSeconds: 600,
			});
			await seedServiceAttendance(request2.id, scholarProfile.id, {
				durationSeconds: 1200,
			});

			const session = createScholarSession({ id: scholar.id });
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.requests.scholarHistory({});

			// Assert
			expect(result.items).toHaveLength(2);
			expect(result.totalDurationSeconds).toBe(1800);
			expect(result.items[0].request).toBeDefined();
		});

		it("deve falhar se estudante tentar acessar histórico de bolsista", async () => {
			const student = await seedUser({ role: "student" });
			const session = createStudentSession({ id: student.id });
			caller = appRouter.createCaller(() => session);

			await expect(
				caller.requests.scholarHistory({}),
			).rejects.toMatchObject({
				code: "FORBIDDEN",
			});
		});
	});
});
