import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { scholarProcedure } from "@/trpc/context";

export const toggleAvailability = scholarProcedure
	.meta({ openapi: { method: "POST", path: "/profiles/availability" } })
	.output(z.any())
	.mutation(async ({ ctx }) => {
		const profile = await db.query.scholarProfile.findFirst({
			where: eq(schema.scholarProfile.userId, ctx.session.user.id),
		});

		if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

		if (!profile.isApproved) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message:
					"Seu cadastro ainda não foi aprovado pelo NAC. Aguarde a aprovação para ativar a disponibilidade.",
			});
		}

		const [updated] = await db
			.update(schema.scholarProfile)
			.set({
				isAvailable: !profile.isAvailable,
				updatedAt: new Date(),
			})
			.where(eq(schema.scholarProfile.id, profile.id))
			.returning();

		return updated;
	});
