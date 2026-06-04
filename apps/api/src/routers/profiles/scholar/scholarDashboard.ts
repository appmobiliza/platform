import {
	getCurrentShift,
	type scholarShiftValues,
} from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, avg, count, eq, gte, lte, sql } from "@mobiliza/db/drizzle";
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

export const scholarDashboard = managerProcedure
	.query(async () => {
		const scholars = await db.query.scholarProfile.findMany({
			with: {
				user: true,
			},
			orderBy: (table, { asc }) => [asc(table.createdAt)],
		});

		// ─── Aggregate attendance metrics per scholar ─────────────────────
		const attendanceRows = await db
			.select({
				scholarProfileId: schema.serviceAttendance.scholarProfileId,
				servicesAmount: count(schema.serviceAttendance.id),
				totalDurationSeconds:
					sql<number>`COALESCE(SUM(${schema.serviceAttendance.durationSeconds}), 0)`,
				avgDurationSeconds:
					sql<number>`AVG(${schema.serviceAttendance.durationSeconds})`,
			})
			.from(schema.serviceAttendance)
			.innerJoin(
				schema.serviceRequest,
				eq(schema.serviceAttendance.requestId, schema.serviceRequest.id),
			)
			.where(eq(schema.serviceRequest.status, "completed"))
			.groupBy(schema.serviceAttendance.scholarProfileId);

		const attendanceMap = new Map(
			attendanceRows.map((row) => [
				row.scholarProfileId,
				{
					servicesAmount: Number(row.servicesAmount),
					totalDurationSeconds: Number(row.totalDurationSeconds),
					avgDurationSeconds: row.avgDurationSeconds
						? Math.round(Number(row.avgDurationSeconds))
						: 0,
				},
			]),
		);

		const scholarsWithStatus = scholars.map((profile) => {
			const status = getScholarDashboardStatus(profile);
			const stats = attendanceMap.get(profile.id);

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
				summary: {
					servicesAmount: stats?.servicesAmount ?? 0,
					monthHours: stats?.totalDurationSeconds
						? Math.round(stats.totalDurationSeconds / 3600)
						: 0,
					averageDuration: stats?.avgDurationSeconds
						? Math.round(stats.avgDurationSeconds / 60)
						: 0,
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
