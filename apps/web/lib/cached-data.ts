import "server-only";

import { getCurrentShift } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, avg, count, desc, eq, gte, lte, sql } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";

import { cacheLife, cacheTag } from "next/cache";

// ─── Tipos ──────────────────────────────────────────────────────────────────

export interface CachedSummary {
	totalRequests: number;
	completedRequests: number;
	cancelledRequests: number;
	unattendedRequests: number;
	completionRate: number;
	avgDurationSeconds: number | null;
	avgRating: number | null;
}

export type ScholarStatus = "available" | "busy" | "off_shift" | "pending";

export interface CachedScholarEntry {
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		role: string;
	};
	profile: {
		id: string;
		userId: string;
		enrollment: string;
		course: string;
		campus: string;
		phone: string;
		shift: string;
		isAvailable: boolean;
		isActive: boolean;
	};
	status: ScholarStatus;
}

export interface CachedScholarDashboard {
	totalScholars: number;
	availableNow: number;
	inAttendance: number;
	scholars: CachedScholarEntry[];
}

export interface CachedStudentDashboard {
	totalStudents: number;
	requestedToday: number;
	visualImpairmentCount: number;
	mobilityCount: number;
	students: Array<{
		user: {
			id: string;
			name: string;
			email: string;
			image: string | null;
			role: string;
		};
		profile: {
			id: string;
			userId: string;
			enrollment: string;
			course: string;
			campus: string;
			phone: string;
			shift: string;
			isActive: boolean;
			disabilities: string[];
		};
		summary: {
			servicesAmount: number;
			monthHours: number;
			averageDuration: number;
			frequentRoutes: Array<{ route: string; amount: number }>;
			recentRoutes: Array<{
				route: string;
				date: string;
				status: string;
			}>;
			frequentScholars: Array<{ name: string; amount: number }>;
		};
	}>;
}

export interface CachedLocation {
	id: string;
	name: string;
	abbreviation: string | null;
}

export interface CachedUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: string;
	updatedAt: string;
	role: string;
}

export interface CachedStudentProfile {
	id: string;
	userId: string;
	enrollment: string;
	course: string;
	campus: string;
	phone: string;
	shift: string;
	isActive: boolean;
	user: CachedUser;
}

export interface CachedScholarProfileFull {
	id: string;
	userId: string;
	enrollment: string;
	course: string;
	campus: string;
	phone: string;
	shift: string;
	isAvailable: boolean;
	isActive: boolean;
	user: CachedUser;
}

export interface CachedAttendance {
	id: string;
	durationSeconds: number | null;
	status: string | null;
	scholarProfile: CachedScholarProfileFull | null;
}

export interface CachedManagerRequest {
	id: string;
	createdAt: string;
	status: string;
	notes: string | null;
	originLocation: CachedLocation | null;
	destinationLocation: CachedLocation | null;
	studentProfile: CachedStudentProfile;
	attendance: CachedAttendance | null;
}

export interface CachedScholarPerformance {
	scholarProfileId: string;
	scholarName: string;
	scholarEmail: string;
	totalAttendances: number;
	avgRating: number | null;
	avgDurationSeconds: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getScholarStatus(profile: {
	isActive: boolean;
	isAvailable: boolean;
	shift: string;
}): ScholarStatus {
	if (!profile.isActive) return "pending";
	if (profile.shift !== getCurrentShift()) return "off_shift";
	if (profile.isAvailable) return "available";
	return "busy";
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
	from: string,
	to: string,
): Promise<CachedSummary> {
	"use cache: remote";
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
	};
}

/**
 * Painel de bolsistas (status, turno, etc.).
 * Cache: 15s stale + 30s revalidate.
 */
export async function getCachedScholarDashboard(): Promise<CachedScholarDashboard> {
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
		const { createdAt, updatedAt, ...userRest } = profile.user;

		return {
			user: {
				...userRest,
				createdAt: createdAt.toISOString(),
				updatedAt: updatedAt.toISOString(),
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
	};
}

/**
 * Painel de estudantes (cadastros, deficiências, resumo).
 * Cache: 30s stale + 60s revalidate.
 */
export async function getCachedStudentDashboard(): Promise<CachedStudentDashboard> {
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
			const { disabilities, requests, user: studentUser, ...profile } = student;
			const { createdAt: uCreatedAt, updatedAt: uUpdatedAt, ...userRest } = studentUser;
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
				user: {
					...userRest,
					createdAt: uCreatedAt.toISOString(),
					updatedAt: uUpdatedAt.toISOString(),
				},
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
	};
}

/**
 * Lista de solicitações do manager.
 * Cache: 15s stale + 30s revalidate.
 */
export async function getCachedManagerList(
	limit: number,
): Promise<CachedManagerRequest[]> {
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

	return rows.map((row) => {
		const { createdAt, ...rest } = row;

		return {
			...rest,
			createdAt: createdAt.toISOString(),
		} as unknown as CachedManagerRequest;
	});
}

/**
 * Performance dos bolsistas no período (ranking).
 * Cache: 60s stale + 120s revalidate.
 */
export async function getCachedScholarPerformance(
	from: string,
	to: string,
): Promise<CachedScholarPerformance[]> {
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
		avgRating: row.avgRating ? Number(Number(row.avgRating).toFixed(1)) : null,
		avgDurationSeconds: row.avgDurationSeconds
			? Math.round(Number(row.avgDurationSeconds))
			: null,
	}));
}
