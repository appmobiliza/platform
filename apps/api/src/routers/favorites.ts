import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc/context";
import {
  CreateFavoriteRouteSchema,
  DeleteFavoriteRouteSchema,
} from "@mobiliza/contracts";
import {
  createFavoriteRoute,
  deleteFavoriteRoute,
  AppError,
} from "@mobiliza/domain";
import { db } from "@mobiliza/db/client";
import { eq } from "drizzle-orm";
import * as schema from "@mobiliza/db/schema";

export const favoritesRouter = router({
  create: protectedProcedure
    .input(CreateFavoriteRouteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const route = await createFavoriteRoute(input, ctx.session.user.id, db);
        return route;
      } catch (error) {
        if (error instanceof AppError) {
          throw new TRPCError({
            code: error.code as any,
            message: error.message,
          });
        }
        throw error;
      }
    }),

  delete: protectedProcedure
    .input(DeleteFavoriteRouteSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await deleteFavoriteRoute(input.routeId, ctx.session.user.id, db);
        return result;
      } catch (error) {
        if (error instanceof AppError) {
          throw new TRPCError({
            code: error.code as any,
            message: error.message,
          });
        }
        throw error;
      }
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
