import "server-only";

import type { AppRouter } from "@mobiliza/api/router";
import { getCurrentShift } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, avg, count, desc, eq, gte, lte, sql } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";

import { cacheLife, cacheTag } from "next/cache";

import { getTodayRange } from "./dashboard-data";

// ─── Tipos herdados do tRPC ─────────────────────────────────────────────────

type TRPCCaller = ReturnType<AppRouter["createCaller"]>;

/** Tipo do retorno de `metrics.summary` */
type SummaryOutput = Awaited<ReturnType<TRPCCaller["metrics"]["summary"]>>;

/** Tipo do retorno de `profiles.scholarDashboard` */
type ScholarDashboardOutput = Awaited<
	ReturnType<TRPCCaller["profiles"]["scholarDashboard"]>
>;

/** Tipo do retorno de `profiles.studentDashboard` */
type StudentDashboardOutput = Awaited<
	ReturnType<TRPCCaller["profiles"]["studentDashboard"]>
>;

/** Tipo do retorno de `requests.managerList` — item individual */
type ManagerListOutput = Awaited<
	ReturnType<TRPCCaller["requests"]["managerList"]>
>;
export type CachedManagerRequest = ManagerListOutput[number];

/** Tipo do retorno de `metrics.scholarPerformance` */
type ScholarPerformanceOutput = Awaited<
	ReturnType<TRPCCaller["metrics"]["scholarPerformance"]>
>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getScholarStatus(profile: {
	isActive: boolean;
	isAvailable: boolean;
	shift: string;
}) {
	if (!profile.isActive) return "pending" as const;
	if (profile.shift !== getCurrentShift()) return "off_shift" as const;
	if (profile.isAvailable) return "available" as const;
	return "busy" as const;
}

function getRouteLabel(request: {
	originLocation?: {
		abbreviation?: string | null;
		name?: string | null;
	} | null;
	destinationLocation?: {
		abbreviation?: string | null;
		name?: string | null;
	} | null;
}): string {
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

function getTopCounts(
	items: string[],
	limit = 3,
): Array<{ name: string; amount: number }> {
	const counts = new Map<string, number>();
	for (const item of items) {
		counts.set(item, (counts.get(item) ?? 0) + 1);
	}
	return Array.from(counts.entries())
		.sort(([, a], [, b]) => b - a)
		.slice(0, limit)
		.map(([name, amount]) => ({ name, amount }));
}

// ─── Funções cacheadas ───────────────────────────────────────────────────────

/**
 * Métricas agregadas do período (cards do topo).
 * Cache: 30s stale + 60s revalidate = no máximo 1 requisição ao DB por minuto.
 */
export async function getCachedSummary(
	from?: string,
	to?: string,
): Promise<SummaryOutput> {
	"use cache: remote";

	// Se não receber um range explícito, usa o dia atual
	if (!from || !to) {
		const todayRange = getTodayRange();
		from = todayRange.from;
		to = todayRange.to;
	}

	cacheLife({ stale: 30, revalidate: 60, expire: 300 });
	cacheTag("metrics-summary");

	const fromDate = new Date(from);
	const toDate = new Date(to);

	const inPeriod = and(
		gte(schema.serviceRequest.createdAt, fromDate),
		lte(schema.serviceRequest.createdAt, toDate),
	);

	const [totals] = await db
		.select({
			total: count(),
			completed: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')`,
			cancelled: sql<number>`COUNT(*) FILTER (WHERE status = 'cancelled')`,
			unattended: sql<number>`COUNT(*) FILTER (WHERE status = 'unattended')`,
		})
		.from(schema.serviceRequest)
		.where(inPeriod);

	const [attendanceStats] = await db
		.select({
			avgDurationSeconds: avg(schema.serviceAttendance.durationSeconds),
			avgRating: avg(schema.serviceAttendance.rating),
		})
		.from(schema.serviceAttendance)
		.innerJoin(
			schema.serviceRequest,
			eq(schema.serviceAttendance.requestId, schema.serviceRequest.id),
		)
		.where(inPeriod);

	return {
		totalRequests: Number(totals?.total ?? 0),
		completedRequests: Number(totals?.completed ?? 0),
		cancelledRequests: Number(totals?.cancelled ?? 0),
		unattendedRequests: Number(totals?.unattended ?? 0),
		completionRate: totals?.total
			? Number(totals.completed) / Number(totals.total)
			: 0,
		avgDurationSeconds: attendanceStats?.avgDurationSeconds
			? Math.round(Number(attendanceStats.avgDurationSeconds))
			: null,
		avgRating: attendanceStats?.avgRating
			? Number(Number(attendanceStats.avgRating).toFixed(1))
			: null,
	} as SummaryOutput;
}

/**
 * Painel de bolsistas (status, turno, etc.).
 * Cache: 15s stale + 30s revalidate.
 */
export async function getCachedScholarDashboard(): Promise<ScholarDashboardOutput> {
	"use cache: remote";
	cacheLife({ stale: 15, revalidate: 30, expire: 120 });
	cacheTag("scholar-dashboard");

	const scholars = await db.query.scholarProfile.findMany({
		with: { user: true },
		orderBy: (table, { asc }) => [asc(table.createdAt)],
	});

	const scholarsWithStatus = scholars.map((profile) => {
		const status = getScholarStatus({
			isActive: profile.isActive,
			isAvailable: profile.isAvailable,
			shift: profile.shift,
		});

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
				isAvailable: profile.isAvailable,
				isActive: profile.isActive,
			},
			status,
		};
	});

	return {
		totalScholars: scholarsWithStatus.length,
		availableNow: scholarsWithStatus.filter((s) => s.status === "available")
			.length,
		inAttendance: scholarsWithStatus.filter((s) => s.status === "busy")
			.length,
		scholars: scholarsWithStatus,
	} as ScholarDashboardOutput;
}

/**
 * Painel de estudantes (cadastros, deficiências, resumo).
 * Cache: 30s stale + 60s revalidate.
 */
export async function getCachedStudentDashboard(): Promise<StudentDashboardOutput> {
	"use cache: remote";
	cacheLife({ stale: 30, revalidate: 60, expire: 300 });
	cacheTag("student-dashboard");

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
								with: { user: true },
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

	const activeStudents = students.filter((s) => s.isActive);
	const allRequests = students.flatMap((s) => s.requests);
	const requestedToday = new Set(
		allRequests
			.filter((req) => {
				const created = new Date(req.createdAt);
				return created >= todayStart && created <= todayEnd;
			})
			.map((req) => req.studentProfileId),
	).size;

	const visualImpairmentCount = students.filter((s) =>
		s.disabilities.some((d) =>
			["blindness", "low_vision"].includes(d.disabilityType),
		),
	).length;

	const mobilityCount = students.filter((s) =>
		s.disabilities.some((d) =>
			["physical_disability", "reduced_mobility"].includes(
				d.disabilityType,
			),
		),
	).length;

	return {
		totalStudents: activeStudents.length,
		requestedToday,
		visualImpairmentCount,
		mobilityCount,
		students: students.map((student) => {
			const { disabilities, requests, user, ...profile } = student;
			const sortedRequests = [...requests].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime(),
			);
			const completedRequests = requests.filter(
				(r) => r.status === "completed",
			);
			const totalDurationSeconds = completedRequests.reduce(
				(total, r) => total + (r.attendance?.durationSeconds ?? 0),
				0,
			);

			return {
				user,
				profile: {
					...profile,
					disabilities: disabilities.map((d) => d.disabilityType),
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
					frequentRoutes: getTopCounts(
						requests.map((r) => getRouteLabel(r)),
					).map(({ name, amount }) => ({ route: name, amount })),
					recentRoutes: sortedRequests.slice(0, 3).map((r) => ({
						route: getRouteLabel(r),
						date: new Date(r.createdAt).toISOString(),
						status: r.status,
					})),
					frequentScholars: getTopCounts(
						requests
							.map(
								(r) => r.attendance?.scholarProfile?.user?.name,
							)
							.filter((name): name is string => Boolean(name)),
					),
				},
			};
		}),
	} as StudentDashboardOutput;
}

/**
 * Lista de solicitações do manager.
 * Cache: 15s stale + 30s revalidate.
 */
export async function getCachedManagerList(
	limit: number,
): Promise<ManagerListOutput> {
	"use cache";
	cacheLife({ stale: 15, revalidate: 30, expire: 120 });
	cacheTag("manager-requests");

	const rows = await db.query.serviceRequest.findMany({
		with: {
			originLocation: true,
			destinationLocation: true,
			studentProfile: {
				with: { user: true },
			},
			attendance: {
				with: {
					scholarProfile: {
						with: { user: true },
					},
				},
			},
		},
		orderBy: [desc(schema.serviceRequest.createdAt)],
		limit,
	});

	return rows.map((row) => ({
		...row,
		createdAt: row.createdAt.toISOString(),
	})) as unknown as ManagerListOutput;
}

/**
 * Performance dos bolsistas no período (ranking).
 * Cache: 60s stale + 120s revalidate.
 */
export async function getCachedScholarPerformance(
	from: string,
	to: string,
): Promise<ScholarPerformanceOutput> {
	"use cache: remote";
	cacheLife({ stale: 60, revalidate: 120, expire: 600 });
	cacheTag("scholar-performance");

	const fromDate = new Date(from);
	const toDate = new Date(to);

	const rows = await db
		.select({
			scholarProfileId: schema.scholarProfile.id,
			scholarName: schema.user.name,
			scholarEmail: schema.user.email,
			totalAttendances: count(),
			avgRating: avg(schema.serviceAttendance.rating),
			avgDurationSeconds: avg(schema.serviceAttendance.durationSeconds),
		})
		.from(schema.serviceAttendance)
		.innerJoin(
			schema.scholarProfile,
			eq(
				schema.serviceAttendance.scholarProfileId,
				schema.scholarProfile.id,
			),
		)
		.innerJoin(
			schema.user,
			eq(schema.scholarProfile.userId, schema.user.id),
		)
		.innerJoin(
			schema.serviceRequest,
			eq(schema.serviceAttendance.requestId, schema.serviceRequest.id),
		)
		.where(
			and(
				gte(schema.serviceRequest.createdAt, fromDate),
				lte(schema.serviceRequest.createdAt, toDate),
				eq(schema.serviceRequest.status, "completed"),
			),
		)
		.groupBy(schema.scholarProfile.id, schema.user.name, schema.user.email)
		.orderBy(desc(count()));

	return rows.map((row) => ({
		scholarProfileId: row.scholarProfileId,
		scholarName: row.scholarName,
		scholarEmail: row.scholarEmail,
		totalAttendances: Number(row.totalAttendances),
		avgRating: row.avgRating
			? Number(Number(row.avgRating).toFixed(1))
			: null,
		avgDurationSeconds: row.avgDurationSeconds
			? Math.round(Number(row.avgDurationSeconds))
			: null,
	})) as unknown as ScholarPerformanceOutput;
}
