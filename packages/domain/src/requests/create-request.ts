import { z } from "zod";
import { CreateRequestSchema } from "@mobiliza/contracts";
import type { Database } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { ForbiddenError, BadRequestError, ConflictError } from "../errors";

/** Gera um ID de request no formato `req_<timestamp>_<random>` */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function createRequest(
  input: z.infer<typeof CreateRequestSchema>,
  userId: string,
  db: Database
) {
  const studentProfile = await db.query.studentProfile.findFirst({
    where: eq(schema.studentProfile.userId, userId),
  });

  if (!studentProfile) {
    throw new ForbiddenError("Apenas estudantes cadastrados podem criar solicitações.");
  }

  if (!studentProfile.isActive) {
    throw new ForbiddenError("Seu perfil está inativo. Entre em contato com o NAC.");
  }

  if (input.originLocationId === input.destinationLocationId) {
    throw new BadRequestError("Origem e destino não podem ser o mesmo local.");
  }

  // Verifica se o estudante já tem uma solicitação ativa
  const activeRequest = await db.query.serviceRequest.findFirst({
    where: and(
      eq(schema.serviceRequest.studentProfileId, studentProfile.id),
      sql`${schema.serviceRequest.status} IN ('pending', 'accepted', 'ongoing')`,
    ),
  });

  if (activeRequest) {
    throw new ConflictError(
      "Você já tem uma solicitação em andamento. Conclua ou cancele antes de criar uma nova."
    );
  }

  const id = generateRequestId();

  const [request] = await db
    .insert(schema.serviceRequest)
    .values({
      id,
      studentProfileId: studentProfile.id,
      originLocationId: input.originLocationId,
      destinationLocationId: input.destinationLocationId,
      notes: input.notes,
      status: "pending",
    })
    .returning();

  return request;
}
