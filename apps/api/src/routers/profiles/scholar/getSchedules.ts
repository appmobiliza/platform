import { db } from "@mobiliza/db/client";
import { protectedProcedure } from "@mobiliza/trpc";

import { z } from "zod";

export const getSchedules = protectedProcedure
	.meta({ openapi: { method: "GET", path: "/profiles/schedules" } })
	.output(z.any())
	.query(async () => {
		const scholars = await db.query.scholarProfile.findMany({
			with: {
				user: true,
				weeklySchedule: true,
			},
			orderBy: (table, { asc }) => [asc(table.createdAt)],
		});

		const schedules = scholars
			.filter((scholar) => scholar.isActive)
			.map((scholar) => ({
				scholarId: scholar.id,
				userId: scholar.userId,
				name: scholar.user.name,
				email: scholar.user.email,
				enrollment: scholar.enrollment,
				course: scholar.course,
				campus: scholar.campus,
				schedule: scholar.weeklySchedule.map((entry) => ({
					dayOfWeek: entry.dayOfWeek,
					shift: entry.shift,
				})),
			}));

		return schedules;
	});
