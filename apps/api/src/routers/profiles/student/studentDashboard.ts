import { db } from "@mobiliza/db/client";
import { managerProcedure } from "@mobiliza/trpc";

import { z } from "zod";

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

	return `${origin} \u2192 ${destination}`;
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

export const studentDashboard = managerProcedure
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

		const activeStudents = students.filter((profile) => profile.isActive);
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
				["blindness", "low_vision"].includes(disability.disabilityType),
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
				const { disabilities, requests, user, ...profile } = student;
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
								request.attendance?.scholarProfile?.user?.name,
						)
						.filter((name): name is string => Boolean(name)),
				);

				return {
					user,
					profile: {
						...profile,
						disabilities: disabilities.map(
							(disability) => disability.disabilityType,
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
								date: new Date(request.createdAt).toISOString(),
								status: request.status,
							})),
						frequentScholars,
					},
				};
			}),
		};
	});
