import { db } from "@mobiliza/db/client";
import { desc } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { managerProcedure } from "@mobiliza/trpc";

import { z } from "zod";

export const managerList = managerProcedure
	.meta({ openapi: { method: "GET", path: "/requests/manager" } })
	.input(
		z
			.object({
				limit: z.number().int().min(1).max(500).default(100),
			})
			.default({ limit: 100 }),
	)
	.output(z.any())
	.query(async ({ input }) => {
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
