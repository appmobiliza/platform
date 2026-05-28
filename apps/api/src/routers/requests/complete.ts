import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { TRPCError } from "@trpc/server";

import { scholarProcedure } from "@/trpc/context";

import { execTx } from "./shared";

export const complete = scholarProcedure
	.input(RequestIdSchema)
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

		await execTx(async (tx) => {
			await tx
				.update(schema.serviceRequest)
				.set({ status: "completed", updatedAt: now })
				.where(eq(schema.serviceRequest.id, input.requestId));

			await tx
				.update(schema.serviceAttendance)
				.set({ completedAt: now, durationSeconds, updatedAt: now })
				.where(eq(schema.serviceAttendance.id, attendance.id));
		});

		await ctx.realtime.publish(
			`request:${input.requestId}`,
			"request:completed",
			{ requestId: input.requestId, durationSeconds },
		);

		return { durationSeconds };
	});
