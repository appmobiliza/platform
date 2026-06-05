import { UpdateScholarBySelfSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";

export const updateScholar = protectedProcedure
	.input(UpdateScholarBySelfSchema)

	.mutation(async ({ ctx, input }) => {
		const { name, ...profileData } = input;

		// Atualiza o nome do usuário se informado
		if (name) {
			await db
				.update(schema.user)
				.set({ name, updatedAt: new Date() })
				.where(eq(schema.user.id, ctx.session.user.id));
		}

		// Se houver dados de perfil para atualizar
		if (Object.keys(profileData).length > 0) {
			const [profile] = await db
				.update(schema.scholarProfile)
				.set({ ...profileData, updatedAt: new Date() })
				.where(eq(schema.scholarProfile.userId, ctx.session.user.id))
				.returning();

			return profile;
		}

		// Apenas o nome foi alterado — retorna o perfil atual
		return db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});
	});
