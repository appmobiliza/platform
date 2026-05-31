import { z } from "zod";

export const CreateFavoriteRouteSchema = z.object({
  name: z.string().min(2).max(50),
  originLocationId: z.string(),
  destinationLocationId: z.string(),
});

export const DeleteFavoriteRouteSchema = z.object({
  routeId: z.string(),
});
