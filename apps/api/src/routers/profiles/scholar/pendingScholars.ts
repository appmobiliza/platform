import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";

import { z } from "zod";

import { managerProcedure } from "@/trpc/context";

export const pendingScholars = managerProcedure
	.meta({
		openapi: { method: "GET", path: "/profiles/pending-scholars" },
	})
	.output(z.any())
	.query(async () => {
		return db.query.scholarProfile.findMany({
			where: eq(schema.scholarProfile.isApproved, false),
			with: { user: true },
			orderBy: (t, { asc }) => [asc(t.createdAt)],
		});
	});
