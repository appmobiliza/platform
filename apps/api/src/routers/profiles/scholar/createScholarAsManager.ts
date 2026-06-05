import { InsertScholarAsManagerSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { managerProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";

export const createScholarAsManager = managerProcedure
	.input(InsertScholarAsManagerSchema)

	.mutation(async ({ input }) => {
		const { name, email, ...profileData } = input;

		// Normaliza o email antes de verificar duplicidade
		const normalizedEmail = email.toLowerCase().trim();

		// Verifica se já existe um usuário com esse email
		const existingUser = await db.query.user.findFirst({
			where: eq(schema.user.email, normalizedEmail),
		});

		if (existingUser) {
			throw new TRPCError({
				code: "CONFLICT",
				message: "Já existe um usuário com este e-mail.",
			});
		}

		// Cria o usuário com role de bolsista
		const [newUser] = await db
			.insert(schema.user)
			.values({
				id: uuidv7(),
				name,
				email: normalizedEmail,
				role: "scholar",
			})
			.returning();

		// Cria o perfil de bolsista vinculado ao novo usuário
		const [profile] = await db
			.insert(schema.scholarProfile)
			.values({
				id: uuidv7(),
				userId: newUser.id,
				...profileData,
				isAvailable: false,
			})
			.returning();

		return profile;
	});
