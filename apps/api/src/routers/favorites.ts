import {
	CreateFavoriteRouteSchema,
	DeleteFavoriteRouteSchema,
} from "@mobiliza/contracts";
import { db } from "@mobiliza/db/client";
import { eq } from "@mobiliza/db/drizzle";
import * as schema from "@mobiliza/db/schema";
import {
	createFavoriteRoute,
	deleteFavoriteRoute,
} from "@mobiliza/domain";
import { protectedProcedure, router } from "@mobiliza/trpc";

export const favoritesRouter = router({
	create: protectedProcedure
		.input(CreateFavoriteRouteSchema)
		.mutation(async ({ ctx, input }) => {
			const route = await createFavoriteRoute(
				input,
				ctx.session.user.id,
				db,
			);
			return route;
		}),

	delete: protectedProcedure
		.input(DeleteFavoriteRouteSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await deleteFavoriteRoute(
				input.routeId,
				ctx.session.user.id,
				db,
			);
			return result;
		}),

	list: protectedProcedure.query(async ({ ctx }) => {
		const studentProfile = await db.query.studentProfile.findFirst({
			where: eq(schema.studentProfile.userId, ctx.session.user.id),
		});

		if (!studentProfile) {
			return [];
		}

		const routes = await db.query.favoriteRoute.findMany({
			where: eq(schema.favoriteRoute.studentProfileId, studentProfile.id),
			with: {
				originLocation: true,
				destinationLocation: true,
			},
			orderBy: (t, { desc }) => [desc(t.createdAt)],
		});

		return routes;
	}),
});
