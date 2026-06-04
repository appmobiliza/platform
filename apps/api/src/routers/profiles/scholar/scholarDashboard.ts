import {
	getCurrentShift,
	type scholarShiftValues,
} from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
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
					isAvailable: profile.isAvailable,
					isActive: profile.isActive,
				},
				status,
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
