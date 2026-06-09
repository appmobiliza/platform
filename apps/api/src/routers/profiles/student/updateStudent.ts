import { UpdateStudentSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";

export const updateStudent = protectedProcedure
	.input(UpdateStudentSchema)

	.mutation(async ({ ctx, input }) => {
		const studentProfile = await db.query.studentProfile.findFirst({
			where: eq(schema.studentProfile.userId, ctx.session.user.id),
		});

		if (!studentProfile) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Perfil de estudante não encontrado.",
			});
		}

		const { name, disabilityTypes, ...profileData } = input;

		// Atualiza o nome do usuário se informado
		if (name) {
			await db
				.update(schema.user)
				.set({ name, updatedAt: new Date() })
				.where(eq(schema.user.id, ctx.session.user.id));
		}

		// Atualiza os campos do perfil, se houver
		if (Object.keys(profileData).length > 0) {
			await db
				.update(schema.studentProfile)
				.set({ ...profileData, updatedAt: new Date() })
				.where(eq(schema.studentProfile.userId, ctx.session.user.id));
		}

		// Atualiza as deficiências, se informadas
		if (disabilityTypes) {
			await db
				.delete(schema.studentDisability)
				.where(
					eq(
						schema.studentDisability.studentProfileId,
						studentProfile.id,
					),
				);

			if (disabilityTypes.length > 0) {
				await db.insert(schema.studentDisability).values(
					disabilityTypes.map((dt) => ({
						id: uuidv7(),
						studentProfileId: studentProfile.id,
						disabilityType: dt,
					})),
				);
			}
		}

		// Retorna o perfil atualizado
		const updated = await db.query.studentProfile.findFirst({
			where: eq(schema.studentProfile.userId, ctx.session.user.id),
			with: { disabilities: true },
		});

		return updated;
	});
