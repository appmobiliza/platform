import { PaginationSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { and, desc, eq, sql } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";

export const studentHistory = protectedProcedure
	.input(PaginationSchema)

	.query(async ({ ctx, input }) => {
		const studentProfile = await db.query.studentProfile.findFirst({
			where: eq(schema.studentProfile.userId, ctx.session.user.id),
		});

		if (!studentProfile) return { items: [], nextCursor: undefined };

		const items = await db.query.serviceRequest.findMany({
			where: and(
				eq(schema.serviceRequest.studentProfileId, studentProfile.id),
				input.cursor
					? sql`${schema.serviceRequest.id} < ${input.cursor}`
					: undefined,
			),
			with: {
				originLocation: true,
				destinationLocation: true,
				attendance: {
					with: { scholarProfile: { with: { user: true } } },
				},
			},
			orderBy: [desc(schema.serviceRequest.createdAt)],
			limit: input.limit + 1,
		});

		const hasMore = items.length > input.limit;
		const page = hasMore ? items.slice(0, input.limit) : items;

		return {
			items: page,
			nextCursor: hasMore ? page[page.length - 1]?.id : undefined,
		};
	});
