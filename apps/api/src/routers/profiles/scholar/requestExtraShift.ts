import { CreateExtraShiftRequestSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

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

		// Verifica se já existe uma solicitação para a mesma data/turno
		const existing = await db.query.extraShiftRequest.findFirst({
			where: (table, { and, eq }) =>
				and(
					eq(table.scholarProfileId, profile.id),
					eq(table.date, input.date),
					eq(table.shift, input.shift),
				),
		});

		if (existing) {
			throw new TRPCError({
				code: "CONFLICT",
				message:
					"Você já possui uma solicitação para esta data e turno.",
			});
		}

		const [request] = await db
			.insert(schema.extraShiftRequest)
			.values({
				id: uuidv7(),
				scholarProfileId: profile.id,
				date: input.date,
				shift: input.shift,
				reason: input.reason,
			})
			.returning();

		return request;
	});
