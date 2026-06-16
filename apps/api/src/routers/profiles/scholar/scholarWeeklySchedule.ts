import { UpsertScheduleSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";

export const scholarWeeklySchedule = scholarProcedure
	.input(UpsertScheduleSchema)

	.mutation(async ({ ctx, input }) => {
		const profile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

		if (!profile.isActive) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Não é possível editar sua escala enquanto estiver inativo. Contate o gestor.",
			});
		}

		const profileId = profile.id;

		// Remove todas as entradas de horário atuais do bolsista
		await db
			.delete(schema.scholarWeeklySchedule)
			.where(
				eq(
					schema.scholarWeeklySchedule.scholarProfileId,
					profileId,
				),
			);

		// Insere as novas entradas
		if (input.entries.length > 0) {
			await db.insert(schema.scholarWeeklySchedule).values(
				input.entries.map((entry) => ({
					id: uuidv7(),
					scholarProfileId: profileId,
					dayOfWeek: entry.dayOfWeek,
					shift: entry.shift,
				})),
			);
		}

		// Retorna a schedule atualizada
		const schedule = await db.query.scholarWeeklySchedule.findMany({
			where: eq(
				schema.scholarWeeklySchedule.scholarProfileId,
				profileId,
			),
		});

		return schedule;
	});
