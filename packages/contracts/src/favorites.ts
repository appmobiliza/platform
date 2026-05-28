import { z } from "zod";

export const CreateFavoriteRouteSchema = z.object({
  name: z.string().min(2).max(50),
  originLocationId: z.number().int().positive(),
  destinationLocationId: z.number().int().positive(),
});

export const DeleteFavoriteRouteSchema = z.object({
  routeId: z.string(),
});
