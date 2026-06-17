/**
 * Router de notícias da UFAL.
 *
 * Expõe uma procedure pública (`news.list`) que busca notícias do portal
 * da UFAL via Plone JSON API. Não exige autenticação — qualquer pessoa
 * pode ver as notícias.
 */

import { publicProcedure, router } from "@mobiliza/trpc";

import { z } from "zod";

import { fetchUfalNews } from "../services/ufal-news.js";

export const newsRouter = router({
	/**
	 * Lista as notícias mais recentes da UFAL, opcionalmente filtradas
	 * por tags (ex.: "acessibilidade").
	 */
	list: publicProcedure
		.input(
			z
				.object({
					/** Tags para filtrar as notícias */
					tags: z.array(z.string()).optional(),
					/** Quantidade máxima de notícias (1-10) */
					limit: z
						.number()
						.int()
						.min(1)
						.max(10)
						.default(5),
				}),
		)
		.query(async ({ input }) => {
			return fetchUfalNews({
				tags: input.tags,
				limit: input.limit,
			});
		}),
});
