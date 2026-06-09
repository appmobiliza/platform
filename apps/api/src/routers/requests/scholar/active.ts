import { db } from "@mobiliza/db/client";
import { and, desc, eq, isNull } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

export const active = scholarProcedure.query(async ({ ctx }) => {
	const scholarProfile = await db.query.scholarProfile.findFirst({
		where: eq(schema.scholarProfile.userId, ctx.session.user.id),
	});

	if (!scholarProfile) return null;

	const attendance = await db.query.serviceAttendance.findFirst({
		where: and(
			eq(schema.serviceAttendance.scholarProfileId, scholarProfile.id),
			isNull(schema.serviceAttendance.completedAt),
		),
		with: {
			request: {
				with: {
					originLocation: true,
					destinationLocation: true,
					studentProfile: {
						with: {
							user: {
								columns: {
									id: true,
									name: true,
									image: true,
								},
							},
							disabilities: {
								columns: {
									disabilityType: true,
								},
							},
						},
					},
				},
			},
		},
		orderBy: [desc(schema.serviceAttendance.acceptedAt)],
	});

	return attendance ?? null;
});
