import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "../../trpc/context";
import { createRequestInput, generateRequestId } from "./shared";

export const create = protectedProcedure
  .input(createRequestInput)
  .mutation(async ({ ctx, input }) => {
    const studentProfile = await db.query.studentProfile.findFirst({
      where: eq(schema.studentProfile.userId, ctx.session.user.id),
    });

    if (!studentProfile) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Apenas estudantes cadastrados podem criar solicitações.",
      });
    }

    if (!studentProfile.isActive) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Seu perfil está inativo. Entre em contato com o NAC.",
      });
    }

    if (input.originLocationId === input.destinationLocationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Origem e destino não podem ser o mesmo local.",
      });
    }

    // Verifica se o estudante já tem uma solicitação ativa
    const activeRequest = await db.query.serviceRequest.findFirst({
      where: and(
        eq(schema.serviceRequest.studentProfileId, studentProfile.id),
        sql`${schema.serviceRequest.status} IN ('pending', 'accepted', 'ongoing')`,
      ),
    });

    if (activeRequest) {
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "Você já tem uma solicitação em andamento. Conclua ou cancele antes de criar uma nova.",
      });
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

    // Notifica bolsistas disponíveis via realtime
    await ctx.realtime.publish("requests:available", "request:new", {
      requestId: request.id,
      studentId: ctx.session.user.id,
      originLocationId: input.originLocationId,
      destinationLocationId: input.destinationLocationId,
    });

    return request;
  });
