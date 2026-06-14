import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "@mobiliza/trpc";

import { TRPCError } from "@trpc/server";

export const me = protectedProcedure
	.query(async ({ ctx }) => {
		const user = await db.query.user.findFirst({
			where: eq(schema.user.id, ctx.session.user.id),
			with: {
				studentProfile: {
					with: {
						disabilities: true,
					},
				},
				scholarProfile: {
					with: {
						weeklySchedule: true,
					},
				},
			},
		});

		if (!user) throw new TRPCError({ code: "NOT_FOUND" });
		return user;
	});
