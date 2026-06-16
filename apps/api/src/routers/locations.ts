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

/** Schema compartilhado com o create — campos editáveis de um local */
const locationUpdateSchema = z.object({
	name: z.string().min(2).max(100),
	abbreviation: z.string().min(1).max(20),
	description: z.string().max(500).optional(),
	latitude: z.number(),
	longitude: z.number(),
});

export const locationsRouter = router({
	/**
	 * Lista todos os locais ativos do campus.
	 * Público — usado no formulário de nova solicitação.
	 */
	list: publicProcedure
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
		.query(async () => {
			return db.query.campusLocation.findMany({
				orderBy: (t, { asc }) => [asc(t.name)],
			});
		}),

	/**
	 * Cria um novo local do campus.
	 */
	create: managerProcedure
		.input(locationUpdateSchema)

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
		.input(z.object({ id: z.string(), isActive: z.boolean() }))

		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(schema.campusLocation)
				.set({ isActive: input.isActive, updatedAt: new Date() })
				.where(eq(schema.campusLocation.id, input.id))
				.returning();

			if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
			return updated;
		}),

	/**
	 * Atualiza os dados de um local.
	 * Apenas managers podem alterar locais.
	 */
	update: managerProcedure
		.input(
			z.object({
				id: z.string(),
				data: locationUpdateSchema,
			}),
		)

		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(schema.campusLocation)
				.set({ ...input.data, updatedAt: new Date() })
				.where(eq(schema.campusLocation.id, input.id))
				.returning();

			if (!updated) throw new TRPCError({ code: "NOT_FOUND" });
			return updated;
		}),
});
