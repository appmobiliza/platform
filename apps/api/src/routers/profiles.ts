/**
 * Router de perfis — criação de perfil de estudante e bolsista,
 * aprovação de bolsistas pelo gestor, e toggle de disponibilidade.
 */

import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

import {
	managerProcedure,
	protectedProcedure,
	router,
	scholarProcedure,
} from "../trpc/context";

const scholarDashboardStatusValues = [
	"available",
	"busy",
	"off_shift",
	"pending",
] as const;

function getScholarDashboardStatus(profile: {
	isApproved: boolean;
	isActive: boolean;
	isAvailable: boolean;
	shift: (typeof schema.scholarShiftValues)[number];
}) {
	if (!profile.isApproved || !profile.isActive) {
		return "pending" as const;
	}

	if (profile.shift !== schema.getCurrentShift()) {
		return "off_shift" as const;
	}

	if (profile.isAvailable) {
		return "available" as const;
	}

	return "busy" as const;
}

function getScholarDashboardStatusLabel(
	status: (typeof scholarDashboardStatusValues)[number],
) {
	switch (status) {
		case "available":
			return "Disponível";
		case "busy":
			return "Em atendimento";
		case "off_shift":
			return "Fora do turno";
		case "pending":
			return "Pendente";
	}
}

function getScholarShiftLabel(
	shift: (typeof schema.scholarShiftValues)[number],
) {
	return schema.scholarShiftLabels[shift];
}

function getRouteLabel(request: {
	originLocation?: { abbreviation: string; name: string } | null;
	destinationLocation?: { abbreviation: string; name: string } | null;
}) {
	const origin =
		request.originLocation?.abbreviation ||
		request.originLocation?.name ||
		"-";
	const destination =
		request.destinationLocation?.abbreviation ||
		request.destinationLocation?.name ||
		"-";

	return `${origin} → ${destination}`;
}

function getStudentRouteStatus(
	status: (typeof schema.requestStatusValues)[number],
) {
	if (status === "completed") {
		return "completed" as const;
	}

	if (status === "cancelled" || status === "unattended") {
		return "canceled" as const;
	}

	return "pending" as const;
}

function getTopCounts(items: string[], limit = 3) {
	const counts = new Map<string, number>();

	for (const item of items) {
		counts.set(item, (counts.get(item) ?? 0) + 1);
	}

	return Array.from(counts.entries())
		.sort(([, countA], [, countB]) => countB - countA)
		.slice(0, limit)
		.map(([name, amount]) => ({ name, amount }));
}

export const profilesRouter = router({
	/**
	 * Retorna o perfil completo do usuário autenticado.
	 * Inclui studentProfile ou scholarProfile conforme o role.
	 */
	me: protectedProcedure
		.meta({ openapi: { method: "GET", path: "/profiles/me" } })
		.output(z.any())
		.query(async ({ ctx }) => {
			const user = await db.query.user.findFirst({
				where: eq(schema.user.id, ctx.session.user.id),
				with: {
					studentProfile: true,
					scholarProfile: true,
				},
			});

			if (!user) throw new TRPCError({ code: "NOT_FOUND" });
			return user;
		}),

	scholarDashboard: managerProcedure
		.meta({ openapi: { method: "GET", path: "/profiles/scholars" } })
		.output(z.any())
		.query(async () => {
			const scholars = await db.query.scholarProfile.findMany({
				with: {
					user: true,
				},
				orderBy: (table, { asc }) => [asc(table.createdAt)],
			});

			const scholarsWithStatus = scholars.map((profile) => {
				const status = getScholarDashboardStatus(profile);

				return {
					user: {
						id: profile.user.id,
						name: profile.user.name,
						email: profile.user.email,
						image: profile.user.image,
						role: profile.user.role,
					},
					profile: {
						id: profile.id,
						userId: profile.userId,
						enrollment: profile.enrollment,
						course: profile.course,
						campus: profile.campus,
						phone: profile.phone,
						shift: profile.shift,
						isApproved: profile.isApproved,
						isAvailable: profile.isAvailable,
						isActive: profile.isActive,
					},
					status,
					statusLabel: getScholarDashboardStatusLabel(status),
					shiftLabel: getScholarShiftLabel(profile.shift),
				};
			});

			const totalScholars = scholarsWithStatus.length;
			const availableNow = scholarsWithStatus.filter(
				(item) => item.status === "available",
			).length;
			const inAttendance = scholarsWithStatus.filter(
				(item) => item.status === "busy",
			).length;

			return {
				cards: [
					{
						title: "Total de bolsistas",
						value: String(totalScholars),
					},
					{
						title: "Disponível agora",
						value: String(availableNow),
						variant: "green" as const,
					},
					{
						title: "Em atendimento",
						value: String(inAttendance),
						variant: "yellow" as const,
					},
				],
				scholars: scholarsWithStatus,
			};
		}),

	studentDashboard: managerProcedure
		.meta({ openapi: { method: "GET", path: "/profiles/students" } })
		.output(z.any())
		.query(async () => {
			const students = await db.query.studentProfile.findMany({
				with: {
					user: true,
					disabilities: true,
					requests: {
						with: {
							originLocation: true,
							destinationLocation: true,
							attendance: {
								with: {
									scholarProfile: {
										with: {
											user: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: (table, { asc }) => [asc(table.createdAt)],
			});

			const now = new Date();
			const todayStart = new Date(now);
			todayStart.setHours(0, 0, 0, 0);
			const todayEnd = new Date(now);
			todayEnd.setHours(23, 59, 59, 999);

			const activeStudents = students.filter(
				(profile) => profile.isActive,
			);
			const allRequests = students.flatMap((profile) => profile.requests);
			const requestedToday = new Set(
				allRequests
					.filter((request) => {
						const createdAt = new Date(request.createdAt);
						return createdAt >= todayStart && createdAt <= todayEnd;
					})
					.map((request) => request.studentProfileId),
			).size;
			const visualImpairmentCount = students.filter((profile) =>
				profile.disabilities.some((disability) =>
					["blindness", "low_vision"].includes(
						disability.disabilityType,
					),
				),
			).length;
			const mobilityCount = students.filter((profile) =>
				profile.disabilities.some((disability) =>
					["physical_disability", "reduced_mobility"].includes(
						disability.disabilityType,
					),
				),
			).length;

			return {
				cards: [
					{
						title: "Total de alunos",
						value: String(activeStudents.length),
					},
					{
						title: "Com solicitação hoje",
						value: String(requestedToday),
						variant: "blue" as const,
					},
					{
						title: "Deficiência visual",
						value: String(visualImpairmentCount),
					},
					{
						title: "Deficiência motora",
						value: String(mobilityCount),
					},
				],
				students: students.map((student) => {
					const { disabilities, requests, user, ...profile } =
						student;
					const sortedRequests = [...requests].sort(
						(requestA, requestB) =>
							new Date(requestB.createdAt).getTime() -
							new Date(requestA.createdAt).getTime(),
					);
					const completedRequests = requests.filter(
						(request) => request.status === "completed",
					);
					const totalDurationSeconds = completedRequests.reduce(
						(total, request) =>
							total + (request.attendance?.durationSeconds ?? 0),
						0,
					);
					const frequentRoutes = getTopCounts(
						requests.map((request) => getRouteLabel(request)),
					).map(({ name, amount }) => ({ route: name, amount }));
					const frequentScholars = getTopCounts(
						requests
							.map(
								(request) =>
									request.attendance?.scholarProfile?.user
										?.name,
							)
							.filter((name): name is string => Boolean(name)),
					);

					return {
						user,
						profile: {
							...profile,
							disabilities: disabilities.map(
								(disability) =>
									schema.disabilityTypeLabels[
										disability.disabilityType
									],
							),
						},
						summary: {
							servicesAmount: requests.length,
							monthHours: Math.round(totalDurationSeconds / 3600),
							averageDuration:
								completedRequests.length > 0
									? Math.round(
											totalDurationSeconds /
												completedRequests.length /
												60,
										)
									: 0,
							frequentRoutes,
							recentRoutes: sortedRequests
								.slice(0, 3)
								.map((request) => ({
									route: getRouteLabel(request),
									date: new Date(
										request.createdAt,
									).toISOString(),
									status: getStudentRouteStatus(
										request.status,
									),
								})),
							frequentScholars,
						},
					};
				}),
			};
		}),

	/**
	 * Onboarding: cria perfil de estudante para o usuário autenticado.
	 * Idempotente — retorna o perfil existente se já cadastrado.
	 */
	createStudent: protectedProcedure
		.meta({ openapi: { method: "POST", path: "/profiles/student" } })
		.input(
			z.object({
				enrollment: z.string().min(4).max(20),
				course: z.enum(schema.courseValues),
				campus: z.enum(schema.campusValues),
				phone: z.string().regex(/^\d{10,11}$/),
				shift: z.enum(schema.studentShiftValues),
				gender: z.enum(schema.genderValues),
				nickname: z.string().max(30).optional(),
				disabilityTypes: z
					.array(z.enum(schema.disabilityTypeValues))
					.min(1),
				attendanceNotes: z.string().max(1000).optional(),
				simplifiedInterface: z.boolean().default(false),
			}),
		)
		.output(z.any())
		.mutation(async ({ ctx, input }) => {
			const existing = await db.query.studentProfile.findFirst({
				where: eq(schema.studentProfile.userId, ctx.session.user.id),
			});

			if (existing) return existing;

			// Garante que o role do usuário está correto
			await db
				.update(schema.user)
				.set({ role: "student", updatedAt: new Date() })
				.where(eq(schema.user.id, ctx.session.user.id));

			const { disabilityTypes, ...profileData } = input;

			const [profile] = await db
				.insert(schema.studentProfile)
				.values({
					id: uuidv7(),
					userId: ctx.session.user.id,
					...profileData,
				})
				.returning();

			if (!profile) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Não foi possível criar o perfil do estudante.",
				});
			}

			await db.insert(schema.studentDisability).values(
				disabilityTypes.map((dt) => ({
					id: uuidv7(),
					studentProfileId: profile.id,
					disabilityType: dt,
				})),
			);

			return profile;
		}),

	/**
	 * Onboarding: cria perfil de bolsista para o usuário autenticado.
	 * O bolsista começa como `isApproved: false` — aguarda aprovação do gestor.
	 */
	createScholar: protectedProcedure
		.meta({ openapi: { method: "POST", path: "/profiles/scholar" } })
		.input(
			z.object({
				enrollment: z.string().min(4).max(20),
				course: z.enum(schema.courseValues),
				campus: z.enum(schema.campusValues),
				shift: z.enum(schema.scholarShiftValues),
				phone: z.string().regex(/^\d{10,11}$/),
				cpf: z.string().regex(/^\d{11}$/),
			}),
		)
		.output(z.any())
		.mutation(async ({ ctx, input }) => {
			const existing = await db.query.scholarProfile.findFirst({
				where: eq(schema.scholarProfile.userId, ctx.session.user.id),
			});

			if (existing) return existing;

			await db
				.update(schema.user)
				.set({ role: "scholar", updatedAt: new Date() })
				.where(eq(schema.user.id, ctx.session.user.id));

			const [profile] = await db
				.insert(schema.scholarProfile)
				.values({
					id: uuidv7(),
					userId: ctx.session.user.id,
					...input,
					isApproved: false,
					isAvailable: false,
				})
				.returning();

			return profile;
		}),

	/**
	 * Bolsista alterna sua disponibilidade.
	 * Apenas bolsistas aprovados podem ficar disponíveis.
	 */
	toggleAvailability: scholarProcedure
		.meta({ openapi: { method: "POST", path: "/profiles/availability" } })
		.output(z.any())
		.mutation(async ({ ctx }) => {
			const profile = await db.query.scholarProfile.findFirst({
				where: eq(schema.scholarProfile.userId, ctx.session.user.id),
			});

			if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

			if (!profile.isApproved) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message:
						"Seu cadastro ainda não foi aprovado pelo NAC. Aguarde a aprovação para ativar a disponibilidade.",
				});
			}

			const [updated] = await db
				.update(schema.scholarProfile)
				.set({
					isAvailable: !profile.isAvailable,
					updatedAt: new Date(),
				})
				.where(eq(schema.scholarProfile.id, profile.id))
				.returning();

			return updated;
		}),

	// ─── Rotas do gestor ──────────────────────────────────────────────────────

	/**
	 * Lista todos os bolsistas pendentes de aprovação.
	 */
	pendingScholars: managerProcedure
		.meta({
			openapi: { method: "GET", path: "/profiles/pending-scholars" },
		})
		.output(z.any())
		.query(async () => {
			return db.query.scholarProfile.findMany({
				where: eq(schema.scholarProfile.isApproved, false),
				with: { user: true },
				orderBy: (t, { asc }) => [asc(t.createdAt)],
			});
		}),

	/**
	 * Aprova ou rejeita um bolsista.
	 * Rejeitar = desativar o perfil (isActive: false).
	 */
	reviewScholar: managerProcedure
		.meta({ openapi: { method: "POST", path: "/profiles/review-scholar" } })
		.input(
			z.object({
				scholarProfileId: z.string(),
				approved: z.boolean(),
			}),
		)
		.output(z.any())
		.mutation(async ({ ctx, input }) => {
			const profile = await db.query.scholarProfile.findFirst({
				where: eq(schema.scholarProfile.id, input.scholarProfileId),
				with: { user: true },
			});

			if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

			const now = new Date();

			const [updated] = await db
				.update(schema.scholarProfile)
				.set({
					isApproved: input.approved,
					isActive: input.approved,
					approvedAt: input.approved ? now : null,
					approvedBy: input.approved ? ctx.session.user.id : null,
					updatedAt: now,
				})
				.where(eq(schema.scholarProfile.id, input.scholarProfileId))
				.returning();

			// Notificação via realtime para o bolsista
			await ctx.realtime.publish(
				`user:${profile.userId}`,
				input.approved ? "scholar:approved" : "scholar:rejected",
				{ scholarProfileId: input.scholarProfileId },
			);

			return updated;
		}),
});
