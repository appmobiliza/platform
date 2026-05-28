import { RequestIdSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { scholarProcedure } from "@/trpc/context";

import { execTx } from "./shared";

export const start = scholarProcedure
	.meta({ openapi: { method: "POST", path: "/requests/start" } })
	.input(RequestIdSchema)
	.output(z.any())
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

		if (!attendance) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Atendimento não encontrado.",
			});
		}

		const now = new Date();

		await execTx(async (tx) => {
			await tx
				.update(schema.serviceRequest)
				.set({ status: "ongoing", updatedAt: now })
				.where(eq(schema.serviceRequest.id, input.requestId));

			await tx
				.update(schema.serviceAttendance)
				.set({ startedAt: now, updatedAt: now })
				.where(eq(schema.serviceAttendance.id, attendance.id));
		});

		await ctx.realtime.publish(
			`request:${input.requestId}`,
			"request:started",
			{ requestId: input.requestId },
		);

		return { success: true };
	});
