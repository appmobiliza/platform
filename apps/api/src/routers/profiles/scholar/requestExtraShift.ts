import { CreateExtraShiftRequestSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

function getTodayString(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export const requestExtraShift = scholarProcedure
	.meta({
		openapi: {
			method: "POST",
			path: "/profiles/extra-shift-requests",
		},
	})
	.input(CreateExtraShiftRequestSchema)
	.output(z.any())
	.mutation(async ({ ctx, input }) => {
		const profile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

		const today = getTodayString();

		// Verifica se já existe uma solicitação para hoje + turno
		const existing = await db.query.extraShiftRequest.findFirst({
			where: (table, { and, eq }) =>
				and(
					eq(table.scholarProfileId, profile.id),
					eq(table.date, today),
					eq(table.shift, input.shift),
				),
		});

		if (existing) {
			throw new TRPCError({
				code: "CONFLICT",
				message:
					"Você já possui uma solicitação para este turno hoje.",
			});
		}

		const [request] = await db
			.insert(schema.extraShiftRequest)
			.values({
				id: uuidv7(),
				scholarProfileId: profile.id,
				date: today,
				shift: input.shift,
				reason: input.reason,
				customReason: input.customReason ?? null,
			})
			.returning();

		return request;
	});
