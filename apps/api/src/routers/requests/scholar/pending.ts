import { db } from "@mobiliza/db/client";
import { desc, eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { scholarProcedure } from "@mobiliza/trpc";

export const pending = scholarProcedure
	.query(async () => {
		return db.query.serviceRequest.findMany({
			where: eq(schema.serviceRequest.status, "pending"),
			with: {
				originLocation: true,
				destinationLocation: true,
				studentProfile: {
					with: {
						user: {
							columns: {
								id: true,
								image: true,
							},
						},
						disabilities: {
							columns: {
								disabilityType: true,
							},
						},
					},
				},
			},
			orderBy: [desc(schema.serviceRequest.createdAt)],
			limit: 50,
		});
	});
