import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "@/trpc/context";

export const me = protectedProcedure
	.meta({ openapi: { method: "GET", path: "/profiles/me" } })
	.output(z.any())
	.query(async ({ ctx }) => {
		const user = await db.query.user.findFirst({
			where: eq(schema.user.id, ctx.session.user.id),
			with: {
				studentProfile: true,
				scholarProfile: true,
			},
		});

		if (!user) throw new TRPCError({ code: "NOT_FOUND" });
		return user;
	});
