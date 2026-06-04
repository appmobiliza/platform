import {
	getCurrentShift,
	type scholarShiftValues,
} from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { aliasedTable, eq, sql } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { managerProcedure } from "@mobiliza/trpc";

function getScholarDashboardStatus(profile: {
	isActive: boolean;
	isAvailable: boolean;
	shift: (typeof scholarShiftValues)[number];
}) {
	if (!profile.isActive) {
		return "pending" as const;
	}

	if (profile.shift !== getCurrentShift()) {
		return "off_shift" as const;
	}

	if (profile.isAvailable) {
		return "available" as const;
	}

	return "busy" as const;
}

function topCounts(
	map: Map<string, number>,
	limit = 3,
): Array<{ name: string; amount: number }> {
	return Array.from(map.entries())
		.sort(([, a], [, b]) => b - a)
		.slice(0, limit)
		.map(([name, amount]) => ({ name, amount }));
}

export const scholarDashboard = managerProcedure
	.query(async () => {
		const scholars = await db.query.scholarProfile.findMany({
			with: {
				user: true,
			},
			orderBy: (table, { asc }) => [asc(table.createdAt)],
		});

		// ─── Load all completed attendances with related data ──────────────
		const originLocation = aliasedTable(
			schema.campusLocation,
			"origin_location",
		);
		const destinationLocation = aliasedTable(
			schema.campusLocation,
			"dest_location",
		);

		const allRows = await db
			.select({
				scholarProfileId: schema.serviceAttendance.scholarProfileId,
				durationSeconds: schema.serviceAttendance.durationSeconds,
				createdAt: schema.serviceRequest.createdAt,
				studentName: schema.user.name,
				route: sql<string>`CONCAT(
					COALESCE(${originLocation.abbreviation}, ${originLocation.name}, '-'),
					' → ',
					COALESCE(${destinationLocation.abbreviation}, ${destinationLocation.name}, '-')
				)`,
			})
			.from(schema.serviceAttendance)
			.innerJoin(
				schema.serviceRequest,
				eq(schema.serviceAttendance.requestId, schema.serviceRequest.id),
			)
			.innerJoin(
				schema.studentProfile,
				eq(schema.serviceRequest.studentProfileId, schema.studentProfile.id),
			)
			.innerJoin(
				schema.user,
				eq(schema.studentProfile.userId, schema.user.id),
			)
			.innerJoin(
				originLocation,
				eq(schema.serviceRequest.originLocationId, originLocation.id),
			)
			.innerJoin(
				destinationLocation,
				eq(
					schema.serviceRequest.destinationLocationId,
					destinationLocation.id,
				),
			)
			.where(eq(schema.serviceRequest.status, "completed"));

		// ─── Process per-scholar aggregations in memory ────────────────────
		const grouped = new Map<
			string,
			{
				servicesAmount: number;
				totalDurationSeconds: number;
				allDurations: number[];
				frequentStudents: Map<string, number>;
				frequentRoutes: Map<string, number>;
			}
		>();
		const scholarWeeks = new Map<
			string,
			Array<{ week: string; amount: number }>
		>();

		for (const row of allRows) {
			let g = grouped.get(row.scholarProfileId);
			if (!g) {
				g = {
					servicesAmount: 0,
					totalDurationSeconds: 0,
					allDurations: [],
					frequentStudents: new Map(),
					frequentRoutes: new Map(),
				};
				grouped.set(row.scholarProfileId, g);
			}

			g.servicesAmount++;

			if (row.durationSeconds) {
				g.totalDurationSeconds += row.durationSeconds;
				g.allDurations.push(row.durationSeconds);
			}

			g.frequentStudents.set(
				row.studentName,
				(g.frequentStudents.get(row.studentName) ?? 0) + 1,
			);
			g.frequentRoutes.set(
				row.route,
				(g.frequentRoutes.get(row.route) ?? 0) + 1,
			);

			// ─── Per-week breakdown ──────────────────────────────────
			const d = new Date(row.createdAt);
			const weekStart = new Date(
				d.getFullYear(),
				d.getMonth(),
				d.getDate() - d.getDay(),
			);
			const weekKey = weekStart.toISOString().slice(0, 10);

			let weeks = scholarWeeks.get(row.scholarProfileId);
			if (!weeks) {
				weeks = [];
				scholarWeeks.set(row.scholarProfileId, weeks);
			}

			const existing = weeks.find((w) => w.week === weekKey);
			if (existing) {
				existing.amount++;
			} else {
				weeks.push({ week: weekKey, amount: 1 });
			}
		}

		// Sort each scholar's weeks chronologically
		for (const [, weeks] of scholarWeeks) {
			weeks.sort((a, b) => a.week.localeCompare(b.week));
		}

		const scholarsWithStatus = scholars.map((profile) => {
			const status = getScholarDashboardStatus(profile);
			const scholarId = profile.id;
			const stats = grouped.get(scholarId);
			const totalDuration = stats?.totalDurationSeconds ?? 0;
			const allDurations = stats?.allDurations ?? [];
			const avgDurationSec =
				allDurations.length > 0
					? Math.round(
						allDurations.reduce((a, b) => a + b, 0) /
						allDurations.length,
					)
					: 0;

			return {
				user: {
					id: profile.user.id,
					name: profile.user.name,
					email: profile.user.email,
					image: profile.user.image,
					role: profile.user.role,
					createdAt: profile.user.createdAt.toISOString(),
				},
				profile: {
					id: scholarId,
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
				summary: {
					servicesAmount: stats?.servicesAmount ?? 0,
					monthHours: totalDuration
						? Math.round(totalDuration / 3600)
						: 0,
					averageDuration: avgDurationSec
						? Math.round(avgDurationSec / 60)
						: 0,
					servicesPerWeek: (scholarWeeks.get(scholarId) ?? []).map(
						(w) => ({ amount: w.amount }),
					),
					frequentStudents: stats
						? topCounts(stats.frequentStudents)
						: [],
					frequentRoutes: stats
						? Array.from(stats.frequentRoutes.entries())
							.sort(([, a], [, b]) => b - a)
							.slice(0, 3)
							.map(([route, amount]) => ({ route, amount }))
						: [],
				},
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
			totalScholars,
			availableNow,
			inAttendance,
			scholars: scholarsWithStatus,
		};
	});
