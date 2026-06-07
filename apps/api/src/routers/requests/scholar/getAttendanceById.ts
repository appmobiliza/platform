import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";

export const getAttendanceById = scholarProcedure
	.input(RequestIdSchema)

	.query(async ({ ctx, input }) => {
		const scholarProfile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!scholarProfile) {
			throw new TRPCError({ code: "FORBIDDEN" });
		}

		const attendance = await db.query.serviceAttendance.findFirst({
			where: and(
				eq(schema.serviceAttendance.requestId, input.requestId),
				eq(
					schema.serviceAttendance.scholarProfileId,
					scholarProfile.id,
				),
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
		});

		if (!attendance) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Atendimento não encontrado.",
			});
		}

		return attendance;
	});
