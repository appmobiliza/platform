import { UpdateScholarScheduleSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { managerProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

export const updateScholarSchedule = managerProcedure
	.input(UpdateScholarScheduleSchema)

	.mutation(async ({ input }) => {
		const { scholarId, entries } = input;

		// Verifica se o bolsista existe
		const profile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.id, scholarId),
		});

		if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

		await db.transaction(async (tx) => {
			// Remove todas as entradas atuais
			await tx
				.delete(schema.scholarWeeklySchedule)
				.where(
					eq(
						schema.scholarWeeklySchedule.scholarProfileId,
						scholarId,
					),
				);

			// Insere as novas entradas
			if (entries.length > 0) {
				await tx.insert(schema.scholarWeeklySchedule).values(
					entries.map((entry) => ({
						id: uuidv7(),
						scholarProfileId: scholarId,
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
				scholarId,
			),
		});

		return schedule;
	});
