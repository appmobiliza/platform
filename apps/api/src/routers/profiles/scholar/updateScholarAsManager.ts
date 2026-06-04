import { UpdateScholarAsManagerSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { managerProcedure } from "@mobiliza/trpc";

export const updateScholarAsManager = managerProcedure
	.input(UpdateScholarAsManagerSchema)

	.mutation(async ({ input }) => {
		const { userId, ...profileData } = input;

		await db
			.update(schema.scholarProfile)
			.set({ ...profileData, updatedAt: new Date() })
			.where(eq(schema.scholarProfile.userId, userId));

		return { success: true };
	});
