import { UpsertScheduleSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

export const scholarWeeklySchedule = scholarProcedure
	.input(UpsertScheduleSchema)

	.mutation(async ({ ctx, input }) => {
		const profile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

		const profileId = profile.id;

		await db.transaction(async (tx) => {
			// Remove todas as entradas de horário atuais do bolsista
			await tx
				.delete(schema.scholarWeeklySchedule)
				.where(
					eq(
						schema.scholarWeeklySchedule.scholarProfileId,
						profileId,
					),
				);

			// Insere as novas entradas
			if (input.entries.length > 0) {
				await tx.insert(schema.scholarWeeklySchedule).values(
					input.entries.map((entry) => ({
						id: uuidv7(),
						scholarProfileId: profileId,
						dayOfWeek: entry.dayOfWeek,
						shift: entry.shift,
					})),
				);
			}
		});

		// Retorna a schedule atualizada
		const schedule = await db.query.scholarWeeklySchedule.findMany({
			where: eq(
				schema.scholarWeeklySchedule.scholarProfileId,
				profileId,
			),
		});

		return schedule;
	});
