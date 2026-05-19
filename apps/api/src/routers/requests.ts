/**
 * Router de solicitações de deslocamento.
 *
 * Cobre o fluxo completo:
 *   estudante cria → bolsista aceita → bolsista inicia → bolsista conclui
 *   → estudante avalia
 *
 * Cada transição de status emite um evento de realtime no canal
 * `request:{id}`, permitindo que ambos os lados vejam atualizações
 * instantâneas sem polling.
 */

import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import {
  router,
  protectedProcedure,
  scholarProcedure,
} from "../trpc/context";

// ─── Schemas de validação ─────────────────────────────────────────────────────

const createRequestInput = z.object({
  originLocationId: z.number().int().positive(),
  destinationLocationId: z.number().int().positive(),
  notes: z.string().max(500).optional(),
});

const paginationInput = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(), // id da última solicitação vista
});

// ─── Helpers internos ─────────────────────────────────────────────────────────

/** Gera um ID de request no formato `req_<timestamp>_<random>` */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateAttendanceId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const requestsRouter = router({
  /**
   * Cria uma nova solicitação de deslocamento.
   * Apenas estudantes podem criar — verificado via studentProfile.
   */
  create: protectedProcedure
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
        requestId: request!.id,
        studentId: ctx.session.user.id,
        originLocationId: input.originLocationId,
        destinationLocationId: input.destinationLocationId,
      });

      return request!;
    }),

  /**
   * Cancela uma solicitação pendente.
   * Apenas o estudante dono da solicitação pode cancelar, e só se ainda
   * estiver em status `pending`.
   */
  cancel: protectedProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const studentProfile = await db.query.studentProfile.findFirst({
        where: eq(schema.studentProfile.userId, ctx.session.user.id),
      });

      if (!studentProfile) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const request = await db.query.serviceRequest.findFirst({
        where: eq(schema.serviceRequest.id, input.requestId),
      });

      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Solicitação não encontrada." });
      }

      if (request.studentProfileId !== studentProfile.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (request.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Não é possível cancelar uma solicitação com status "${request.status}".`,
        });
      }

      const [updated] = await db
        .update(schema.serviceRequest)
        .set({
          status: "cancelled",
          respondedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.serviceRequest.id, input.requestId))
        .returning();

      await ctx.realtime.publish(
        `request:${input.requestId}`,
        "request:cancelled",
        { requestId: input.requestId },
      );

      return updated!;
    }),

  /**
   * Bolsista aceita uma solicitação pendente.
   * Cria um `serviceAttendance` e transiciona a solicitação para `accepted`.
   */
  accept: scholarProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const scholarProfile = await db.query.scholarProfile.findFirst({
        where: eq(schema.scholarProfile.userId, ctx.session.user.id),
      });

      if (!scholarProfile) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (!scholarProfile.isApproved) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Seu cadastro ainda não foi aprovado pelo NAC.",
        });
      }

      if (!scholarProfile.isAvailable) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Você está marcado como indisponível. Ative sua disponibilidade antes de aceitar solicitações.",
        });
      }

      // Transação atômica para evitar race condition entre bolsistas
      return await db.transaction(async (tx) => {
        const request = await tx.query.serviceRequest.findFirst({
          where: and(
            eq(schema.serviceRequest.id, input.requestId),
            eq(schema.serviceRequest.status, "pending"),
          ),
        });

        if (!request) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Solicitação não encontrada ou já foi aceita por outro bolsista.",
          });
        }

        const now = new Date();

        // Atualiza o status da solicitação
        await tx
          .update(schema.serviceRequest)
          .set({ status: "accepted", respondedAt: now, updatedAt: now })
          .where(eq(schema.serviceRequest.id, input.requestId));

        // Cria o registro de atendimento
        const [attendance] = await tx
          .insert(schema.serviceAttendance)
          .values({
            id: generateAttendanceId(),
            requestId: input.requestId,
            scholarProfileId: scholarProfile.id,
            acceptedAt: now,
          })
          .returning();

        // Notifica o estudante via realtime
        await ctx.realtime.publish(
          `request:${input.requestId}`,
          "request:accepted",
          {
            requestId: input.requestId,
            scholarId: ctx.session.user.id,
            scholarName: ctx.session.user.name,
          },
        );

        return { request: { ...request, status: "accepted" }, attendance: attendance! };
      });
    }),

  /**
   * Bolsista marca que chegou ao ponto de origem e o deslocamento começou.
   * Transiciona para `ongoing`.
   */
  start: scholarProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const scholarProfile = await db.query.scholarProfile.findFirst({
        where: eq(schema.scholarProfile.userId, ctx.session.user.id),
      });

      if (!scholarProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const attendance = await db.query.serviceAttendance.findFirst({
        where: and(
          eq(schema.serviceAttendance.requestId, input.requestId),
          eq(schema.serviceAttendance.scholarProfileId, scholarProfile.id),
        ),
      });

      if (!attendance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Atendimento não encontrado.",
        });
      }

      const now = new Date();

      await db.transaction(async (tx) => {
        await tx
          .update(schema.serviceRequest)
          .set({ status: "ongoing", updatedAt: now })
          .where(eq(schema.serviceRequest.id, input.requestId));

        await tx
          .update(schema.serviceAttendance)
          .set({ startedAt: now, updatedAt: now })
          .where(eq(schema.serviceAttendance.id, attendance.id));
      });

      await ctx.realtime.publish(
        `request:${input.requestId}`,
        "request:started",
        { requestId: input.requestId },
      );

      return { success: true };
    }),

  /**
   * Bolsista marca o deslocamento como concluído.
   * Calcula e persiste a duração em segundos.
   */
  complete: scholarProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const scholarProfile = await db.query.scholarProfile.findFirst({
        where: eq(schema.scholarProfile.userId, ctx.session.user.id),
      });

      if (!scholarProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const attendance = await db.query.serviceAttendance.findFirst({
        where: and(
          eq(schema.serviceAttendance.requestId, input.requestId),
          eq(schema.serviceAttendance.scholarProfileId, scholarProfile.id),
        ),
      });

      if (!attendance || !attendance.startedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "O deslocamento ainda não foi iniciado.",
        });
      }

      const now = new Date();
      const durationSeconds = Math.floor(
        (now.getTime() - attendance.startedAt.getTime()) / 1000,
      );

      await db.transaction(async (tx) => {
        await tx
          .update(schema.serviceRequest)
          .set({ status: "completed", updatedAt: now })
          .where(eq(schema.serviceRequest.id, input.requestId));

        await tx
          .update(schema.serviceAttendance)
          .set({ completedAt: now, durationSeconds, updatedAt: now })
          .where(eq(schema.serviceAttendance.id, attendance.id));
      });

      await ctx.realtime.publish(
        `request:${input.requestId}`,
        "request:completed",
        { requestId: input.requestId, durationSeconds },
      );

      return { durationSeconds };
    }),

  /**
   * Estudante avalia o atendimento concluído (1–5 estrelas).
   */
  rate: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const studentProfile = await db.query.studentProfile.findFirst({
        where: eq(schema.studentProfile.userId, ctx.session.user.id),
      });

      if (!studentProfile) throw new TRPCError({ code: "FORBIDDEN" });

      const request = await db.query.serviceRequest.findFirst({
        where: and(
          eq(schema.serviceRequest.id, input.requestId),
          eq(schema.serviceRequest.studentProfileId, studentProfile.id),
          eq(schema.serviceRequest.status, "completed"),
        ),
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Atendimento concluído não encontrado.",
        });
      }

      await db
        .update(schema.serviceAttendance)
        .set({ rating: input.rating, ratingComment: input.comment, updatedAt: new Date() })
        .where(eq(schema.serviceAttendance.requestId, input.requestId));

      return { success: true };
    }),

  /**
   * Histórico paginado do estudante autenticado.
   */
  myHistory: protectedProcedure
    .input(paginationInput)
    .query(async ({ ctx, input }) => {
      const studentProfile = await db.query.studentProfile.findFirst({
        where: eq(schema.studentProfile.userId, ctx.session.user.id),
      });

      if (!studentProfile) return { items: [], nextCursor: undefined };

      const items = await db.query.serviceRequest.findMany({
        where: and(
          eq(schema.serviceRequest.studentProfileId, studentProfile.id),
          input.cursor
            ? sql`${schema.serviceRequest.id} < ${input.cursor}`
            : undefined,
        ),
        with: {
          originLocation: true,
          destinationLocation: true,
          attendance: {
            with: { scholarProfile: { with: { user: true } } },
          },
        },
        orderBy: [desc(schema.serviceRequest.createdAt)],
        limit: input.limit + 1,
      });

      const hasMore = items.length > input.limit;
      const page = hasMore ? items.slice(0, input.limit) : items;

      return {
        items: page,
        nextCursor: hasMore ? page[page.length - 1]?.id : undefined,
      };
    }),

  /**
   * Solicitações disponíveis para o bolsista aceitar.
   * Retorna apenas as solicitações `pending` na ordem de criação.
   */
  available: scholarProcedure.query(async () => {
    return db.query.serviceRequest.findMany({
      where: eq(schema.serviceRequest.status, "pending"),
      with: {
        originLocation: true,
        destinationLocation: true,
        studentProfile: { with: { user: true } },
      },
      orderBy: [desc(schema.serviceRequest.createdAt)],
      limit: 50,
    });
  }),
});
