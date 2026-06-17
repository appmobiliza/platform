import { CompleteAttendanceSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq, isNull } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";

export const complete = scholarProcedure
	.input(CompleteAttendanceSchema)

	.mutation(async ({ ctx, input }) => {
		const scholarProfile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!scholarProfile) throw new TRPCError({ code: "FORBIDDEN" });

		const attendance = await db.query.serviceAttendance.findFirst({
			where: and(
				eq(schema.serviceAttendance.requestId, input.requestId),
				eq(
					schema.serviceAttendance.scholarProfileId,
					scholarProfile.id,
				),
			),
		});

		if (!attendance?.startedAt) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "O deslocamento ainda não foi iniciado.",
			});
		}

		const now = new Date();
		const durationSeconds = Math.floor(
			(now.getTime() - attendance.startedAt.getTime()) / 1000,
		);

		// Calculate distance from route points if provided
		let distanceMeters = input.distanceMeters ?? null;
		if (!distanceMeters && input.routeGeojson?.coordinates) {
			distanceMeters = calculateRouteDistance(
				input.routeGeojson.coordinates,
			);
		}

		// Neon HTTP driver does not support transactions.
		// Atomicity is achieved via conditional WHERE clauses.
		await db
			.update(schema.serviceRequest)
			.set({ status: "completed", updatedAt: now })
			.where(
				and(
					eq(schema.serviceRequest.id, input.requestId),
					eq(schema.serviceRequest.status, "ongoing"),
				),
			);

		await db
			.update(schema.serviceAttendance)
			.set({
				completedAt: now,
				durationSeconds,
				routeGeojson: input.routeGeojson ?? null,
				distanceMeters,
				updatedAt: now,
			})
			.where(
				and(
					eq(schema.serviceAttendance.id, attendance.id),
					isNull(schema.serviceAttendance.completedAt),
				),
			);

		try {
			await ctx.realtime.publish(
				`request:${input.requestId}`,
				"request:completed",
				{ requestId: input.requestId, durationSeconds, distanceMeters },
			);
		} catch (error) {
			console.error(
				"[Realtime] Failed to publish request:completed event:",
				error,
			);
		}

		return { durationSeconds, distanceMeters };
	});

/**
 * Calculate the total distance in meters from a route's GeoJSON coordinates.
 * Each coordinate is [longitude, latitude, unix_timestamp_ms].
 * Uses the Haversine formula for accurate distance on Earth's surface.
 */
function calculateRouteDistance(
	coordinates: Array<[number, number, number]>,
): number {
	if (coordinates.length < 2) return 0;

	const R = 6_371_000; // Earth's radius in meters
	const toRad = (deg: number) => (deg * Math.PI) / 180;

	let totalMeters = 0;

	for (let i = 1; i < coordinates.length; i++) {
		const [, lat1, lon1] = coordinates[i - 1];
		const [, lat2, lon2] = coordinates[i];

		const φ1 = toRad(lat1);
		const φ2 = toRad(lat2);
		const Δφ = toRad(lat2 - lat1);
		const Δλ = toRad(lon2 - lon1);

		const a =
			Math.sin(Δφ / 2) ** 2 +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
		const c = 2 * Math.asin(Math.sqrt(a));

		totalMeters += R * c;
	}

	return Math.round(totalMeters);
}
