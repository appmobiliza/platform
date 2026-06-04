/**
 * Router de locais do campus.
 *
 * Locais são pontos de referência fixos usados como origem/destino
 * nas solicitações. A gestão é feita exclusivamente por managers.
 * A listagem é pública — não exige autenticação.
 */

import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { managerProcedure, publicProcedure, router } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";
import { uuidv7 } from "uuidv7";
import { z } from "zod";

export const locationsRouter = router({
	/**
	 * Lista todos os locais ativos do campus.
	 * Público — usado no formulário de nova solicitação.
	 */
	list: publicProcedure
		.meta({ openapi: { method: "GET", path: "/locations" } })
		.output(z.any())
		.query(async () => {
			return db.query.campusLocation.findMany({
				where: eq(schema.campusLocation.isActive, true),
				orderBy: (t, { asc }) => [asc(t.name)],
			});
		}),

	/**
	 * Retorna todos os locais incluindo inativos — apenas para o painel do gestor.
	 */
	listAll: managerProcedure
		.meta({ openapi: { method: "GET", path: "/locations/all" } })
		.output(z.any())
		.query(async () => {
			return db.query.campusLocation.findMany({
				orderBy: (t, { asc }) => [asc(t.name)],
			});
		}),

	/**
	 * Cria um novo local do campus.
	 */
	create: managerProcedure
		.meta({ openapi: { method: "POST", path: "/locations" } })
		.input(
			z.object({
				name: z.string().min(2).max(100),
				abbreviation: z.string().min(1).max(20),
				description: z.string().max(500).optional(),
				latitude: z.number(),
				longitude: z.number(),
			}),
		)
		.output(z.any())
		.mutation(async ({ input }) => {
			const [location] = await db
				.insert(schema.campusLocation)
				.values({
					id: uuidv7(),
					...input,
				})
				.returning();

			return location;
		}),

	/**
	 * Ativa ou desativa um local.
	 * Locais inativos não aparecem nas opções de solicitação mas
	 * o histórico existente é preservado (onDelete: restrict).
	 */
	setActive: managerProcedure
		.meta({ openapi: { method: "POST", path: "/locations/active" } })
		.input(z.object({ id: z.string(), isActive: z.boolean() }))
		.output(z.any())
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(schema.campusLocation)
				.set({ isActive: input.isActive, updatedAt: new Date() })
				.where(eq(schema.campusLocation.id, input.id))
				.returning();

			if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
			return updated;
		}),
});
