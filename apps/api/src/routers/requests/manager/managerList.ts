import { db } from "@mobiliza/db/client";
import { desc } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { cancelStaleRequests } from "@mobiliza/domain";
import { managerProcedure } from "@mobiliza/trpc";

import { z } from "zod";

export const managerList = managerProcedure
	.input(
		z
			.object({
				limit: z.number().int().min(1).max(500).default(100),
			})
			.default({ limit: 100 }),
	)
	.query(async ({ input, ctx }) => {
		// Cancela solicitações estagnadas antes de buscar a lista
		await cancelStaleRequests(db, ctx.realtime);

		return db.query.serviceRequest.findMany({
			with: {
				originLocation: true,
				destinationLocation: true,
				studentProfile: {
					with: {
						user: true,
					},
				},
				attendance: {
					with: {
						scholarProfile: {
							with: {
								user: true,
							},
						},
					},
				},
			},
			orderBy: [desc(schema.serviceRequest.createdAt)],
			limit: input.limit,
		});
	});
