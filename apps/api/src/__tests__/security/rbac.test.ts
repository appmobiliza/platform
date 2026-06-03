/**
 * Testes de segurança para RBAC (Role-Based Access Control).
 *
 * Testa:
 * - Student tenta accept (scholarProcedure) → FORBIDDEN
 * - Scholar tenta createLocation (managerProcedure) → FORBIDDEN
 * - Unauthenticated tenta create → UNAUTHORIZED
 */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { appRouter } from "../../router";
import {
	seedCampusLocation,
	seedScholarProfile,
	seedServiceRequest,
	seedStudentProfile,
	seedUser,
} from "../helpers/seed";
import {
	createManagerSession,
	createMockTRPCContext,
	createNullSessionContext,
	createScholarSession,
	createStudentSession,
} from "../mocks/context";
import { rollbackTransaction } from "../setup";

let caller: ReturnType<typeof appRouter.createCaller>;

describe("rbac", () => {
	beforeEach(async () => {
		await rollbackTransaction();
		jest.clearAllMocks();
		caller = appRouter.createCaller(() => createMockTRPCContext());
	});

	// ─── Student tentando acessar procedures de Scholar ────────────────────────

	describe("student accessing scholar procedures", () => {
		it("deve negar student ao tentar accept (requests)", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			await seedScholarProfile(scholar.id, { isAvailable: true });
			await seedCampusLocation({ id: "1" });
			await seedCampusLocation({ id: "2" });
			const request = await seedServiceRequest(studentProfile.id, {
				status: "pending",
			});
			const session = createStudentSession({
				id: student.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.accept({ requestId: request.id }),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("deve negar student ao tentar start (requests)", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			const _scholarProfile = await seedScholarProfile(scholar.id, {});
			await seedCampusLocation({ id: "1" });
			await seedCampusLocation({ id: "2" });
			const request = await seedServiceRequest(studentProfile.id, {
				status: "accepted",
			});
			const session = createStudentSession({
				id: student.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.start({ requestId: request.id }),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("deve negar student ao tentar complete (requests)", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			const scholar = await seedUser({ role: "scholar" });
			const studentProfile = await seedStudentProfile(student.id);
			const _scholarProfile = await seedScholarProfile(scholar.id, {});
			await seedCampusLocation({ id: "1" });
			await seedCampusLocation({ id: "2" });
			const request = await seedServiceRequest(studentProfile.id, {
				status: "ongoing",
			});
			const session = createStudentSession({
				id: student.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.complete({ requestId: request.id }),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("deve negar student ao tentar toggleAvailability (profiles)", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			await seedStudentProfile(student.id);
			const session = createStudentSession({
				id: student.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.profiles.toggleAvailability(),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});
	});

	// ─── Scholar tentando acessar procedures de Manager ──────────────────────────

	describe("scholar accessing manager procedures", () => {
		it("deve negar scholar ao tentar create (locations)", async () => {
			// Arrange
			const scholar = await seedUser({ role: "scholar" });
			await seedScholarProfile(scholar.id);
			const session = createScholarSession({
				id: scholar.id,
				role: "scholar",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.locations.create({
					name: "Test",
					abbreviation: "T",
					latitude: 0,
					longitude: 0,
				}),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});

		it("deve negar scholar ao tentar listAll (locations)", async () => {
			// Arrange
			const scholar = await seedUser({ role: "scholar" });
			await seedScholarProfile(scholar.id);
			await seedCampusLocation({ id: "1" });
			const session = createScholarSession({
				id: scholar.id,
				role: "scholar",
			});
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(caller.locations.listAll()).rejects.toMatchObject({
				code: "FORBIDDEN",
			});
		});

		it("deve negar scholar ao tentar metrics (all)", async () => {
			// Arrange
			const scholar = await seedUser({ role: "scholar" });
			await seedScholarProfile(scholar.id);
			const session = createScholarSession({
				id: scholar.id,
				role: "scholar",
			});
			caller = appRouter.createCaller(() => session);
			const dateRange = {
				from: new Date(
					Date.now() - 7 * 24 * 60 * 60 * 1000,
				).toISOString(),
				to: new Date().toISOString(),
			};

			// Act & Assert
			await expect(
				caller.metrics.summary(dateRange),
			).rejects.toMatchObject({ code: "FORBIDDEN" });

			await expect(
				caller.metrics.byOriginLocation(dateRange),
			).rejects.toMatchObject({ code: "FORBIDDEN" });

			await expect(
				caller.metrics.scholarPerformance(dateRange),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});
	});

	// ─── Unauthenticated tentando acessar procedures protegidas ───────────────

	describe("unauthenticated access", () => {
		it("deve negar create (requests) sem autenticação", async () => {
			// Arrange
			await seedCampusLocation({ id: "1" });
			await seedCampusLocation({ id: "2" });
			const session = createNullSessionContext();
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.create({
					originLocationId: "1",
					destinationLocationId: "2",
				}),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		});

		it("deve negar cancel (requests) sem autenticação", async () => {
			// Arrange
			const session = createNullSessionContext();
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.requests.cancel({ requestId: "some-id" }),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		});

		it("deve negar me (profiles) sem autenticação", async () => {
			// Arrange
			const session = createNullSessionContext();
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(caller.profiles.me()).rejects.toMatchObject({
				code: "UNAUTHORIZED",
			});
		});

		it("deve negar list (notifications) sem autenticação", async () => {
			// Arrange
			const session = createNullSessionContext();
			caller = appRouter.createCaller(() => session);

			// Act & Assert
			await expect(
				caller.notifications.list({ limit: 30 }),
			).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		});
	});

	// ─── Student tentando acessar procedures de Manager ───────────────────────

	describe("student accessing manager procedures", () => {
		it("deve negar student ao tentar acessar metrics", async () => {
			// Arrange
			const student = await seedUser({ role: "student" });
			await seedStudentProfile(student.id);
			const session = createStudentSession({
				id: student.id,
				role: "student",
			});
			caller = appRouter.createCaller(() => session);
			const dateRange = {
				from: new Date(
					Date.now() - 7 * 24 * 60 * 60 * 1000,
				).toISOString(),
				to: new Date().toISOString(),
			};

			// Act & Assert
			await expect(
				caller.metrics.summary(dateRange),
			).rejects.toMatchObject({ code: "FORBIDDEN" });
		});
	});

	// ─── Manager acessando procedures corretamente ─────────────────────────────

	describe("manager accessing own procedures", () => {
		it("deve permitir manager criar locations", async () => {
			// Arrange
			const _manager = await seedUser({ role: "manager" });
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);

			// Act
			const result = await caller.locations.create({
				name: "Nova Local",
				abbreviation: "NL",
				latitude: -9.0,
				longitude: -35.7,
			});

			// Assert
			expect(result).toMatchObject({ name: "Nova Local" });
		});

		it("deve permitir manager acessar metrics", async () => {
			// Arrange
			const _manager = await seedUser({ role: "manager" });
			const session = createManagerSession();
			caller = appRouter.createCaller(() => session);
			const dateRange = {
				from: new Date(
					Date.now() - 7 * 24 * 60 * 60 * 1000,
				).toISOString(),
				to: new Date().toISOString(),
			};

			// Act
			const result = await caller.metrics.summary(dateRange);

			// Assert
			expect(result).toMatchObject({
				totalRequests: expect.any(Number),
			});
		});
	});
});
