import { InsertStudentSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

import { protectedProcedure } from "@/trpc/context";

export const createStudent = protectedProcedure
	.meta({ openapi: { method: "POST", path: "/profiles/student" } })
	.input(InsertStudentSchema)
	.output(z.any())
	.mutation(async ({ ctx, input }) => {
		const existing = await db.query.studentProfile.findFirst({
			where: eq(schema.studentProfile.userId, ctx.session.user.id),
		});

		if (existing) return existing;

		// Garante que o role do usuário está correto
		await db
			.update(schema.user)
			.set({ role: "student", updatedAt: new Date() })
			.where(eq(schema.user.id, ctx.session.user.id));

		const { disabilityTypes, ...profileData } = input;

		const [profile] = await db
			.insert(schema.studentProfile)
			.values({
				id: uuidv7(),
				userId: ctx.session.user.id,
				...profileData,
			})
			.returning();

		if (!profile) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Não foi possível criar o perfil do estudante.",
			});
		}

		await db.insert(schema.studentDisability).values(
			disabilityTypes.map((dt) => ({
				id: uuidv7(),
				studentProfileId: profile.id,
				disabilityType: dt,
			})),
		);

		return profile;
	});
