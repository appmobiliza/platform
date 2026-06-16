import { UpdateScholarAsManagerSchema } from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import { managerProcedure } from "@mobiliza/trpc";

export const updateScholarAsManager = managerProcedure
	.input(UpdateScholarAsManagerSchema)

	.mutation(async ({ input }) => {
		const { userId, name, email, ...profileData } = input;

		// Update user-level fields (name, email) if provided
		if (name !== undefined || email !== undefined) {
			await db
				.update(schema.user)
				.set({
					...(name !== undefined ? { name } : {}),
					...(email !== undefined ? { email } : {}),
				})
				.where(eq(schema.user.id, userId));
		}

		// Update scholar profile fields
		await db
			.update(schema.scholarProfile)
			.set({ ...profileData, updatedAt: new Date() })
			.where(eq(schema.scholarProfile.userId, userId));

		return { success: true };
	});
