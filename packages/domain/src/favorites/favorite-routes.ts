import { uuidv7 } from "uuidv7";
import { z } from "zod";
import { CreateFavoriteRouteSchema } from "@mobiliza/contracts";
import type { Database } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { eq, and } from "drizzle-orm";
import { ForbiddenError, BadRequestError, ConflictError, NotFoundError } from "../errors";

export async function createFavoriteRoute(
  input: z.infer<typeof CreateFavoriteRouteSchema>,
  userId: string,
  db: Database
) {
  const studentProfile = await db.query.studentProfile.findFirst({
    where: eq(schema.studentProfile.userId, userId),
  });

  if (!studentProfile) {
    throw new ForbiddenError("Apenas estudantes cadastrados podem criar rotas favoritas.");
  }

  if (input.originLocationId === input.destinationLocationId) {
    throw new BadRequestError("Origem e destino não podem ser o mesmo local.");
  }

  // Verifica se o aluno já atingiu o limite de rotas (ex: 10)
  const existingRoutes = await db.query.favoriteRoute.findMany({
    where: eq(schema.favoriteRoute.studentProfileId, studentProfile.id),
  });

  if (existingRoutes.length >= 10) {
    throw new ConflictError("Você já atingiu o limite de 10 rotas favoritas.");
  }

  // Verifica se a rota já existe (mesma origem e destino)
  const duplicate = existingRoutes.find(
    (r) =>
      r.originLocationId === input.originLocationId &&
      r.destinationLocationId === input.destinationLocationId
  );

  if (duplicate) {
    throw new ConflictError("Você já tem uma rota favorita com esta origem e destino.");
  }

  const id = uuidv7();

  const [route] = await db
    .insert(schema.favoriteRoute)
    .values({
      id,
      studentProfileId: studentProfile.id,
      originLocationId: input.originLocationId,
      destinationLocationId: input.destinationLocationId,
      name: input.name,
    })
    .returning();

  return route;
}

export async function deleteFavoriteRoute(
  routeId: string,
  userId: string,
  db: Database
) {
  const studentProfile = await db.query.studentProfile.findFirst({
    where: eq(schema.studentProfile.userId, userId),
  });

  if (!studentProfile) {
    throw new ForbiddenError("Apenas estudantes podem deletar rotas favoritas.");
  }

  const route = await db.query.favoriteRoute.findFirst({
    where: and(
      eq(schema.favoriteRoute.id, routeId),
      eq(schema.favoriteRoute.studentProfileId, studentProfile.id)
    ),
  });

  if (!route) {
    throw new NotFoundError("Rota favorita não encontrada.");
  }

  await db
    .delete(schema.favoriteRoute)
    .where(eq(schema.favoriteRoute.id, routeId));

  return { success: true };
}
