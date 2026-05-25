/**
 * Router de perfis — criação de perfil de estudante e bolsista,
 * aprovação de bolsistas pelo gestor, e toggle de disponibilidade.
 */

import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import {
  router,
  protectedProcedure,
  scholarProcedure,
  managerProcedure,
} from "../trpc/context";

function generateProfileId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const profilesRouter = router({
  /**
   * Retorna o perfil completo do usuário autenticado.
   * Inclui studentProfile ou scholarProfile conforme o role.
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, ctx.session.user.id),
      with: {
        studentProfile: true,
        scholarProfile: true,
      },
    });

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),

  /**
   * Onboarding: cria perfil de estudante para o usuário autenticado.
   * Idempotente — retorna o perfil existente se já cadastrado.
   */
  createStudent: protectedProcedure
    .input(
      z.object({
        enrollment: z.string().min(4).max(20),
        course: z.string().min(2).max(100),
        phone: z.string().regex(/^\d{10,11}$/),
        disabilityTypes: z
          .array(
            z.enum(["motor", "visual", "auditory", "deafblind", "autism", "other"]),
          )
          .min(1),
        attendanceNotes: z.string().max(1000).optional(),
        audioResponseEnabled: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.studentProfile.findFirst({
        where: eq(schema.studentProfile.userId, ctx.session.user.id),
      });

      if (existing) return existing;

      // Garante que o role do usuário está correto
      await db
        .update(schema.user)
        .set({ role: "student", updatedAt: new Date() })
        .where(eq(schema.user.id, ctx.session.user.id));

      const { disabilityTypes, ...profileData } = input;

      const [profile] = await db
        .insert(schema.studentProfile)
        .values({
          id: generateProfileId("sp"),
          userId: ctx.session.user.id,
          ...profileData,
        })
        .returning();

      await db.insert(schema.studentDisability).values(
        disabilityTypes.map((dt) => ({
          id: generateProfileId("sd"),
          studentProfileId: profile.id,
          disabilityType: dt,
        })),
      );

      return profile;
    }),

  /**
   * Onboarding: cria perfil de bolsista para o usuário autenticado.
   * O bolsista começa como `isApproved: false` — aguarda aprovação do gestor.
   */
  createScholar: protectedProcedure
    .input(
      z.object({
        enrollment: z.string().min(4).max(20),
        course: z.string().min(2).max(100),
        shift: z.enum(["morning", "afternoon", "night"]),
        phone: z.string().regex(/^\d{10,11}$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.scholarProfile.findFirst({
        where: eq(schema.scholarProfile.userId, ctx.session.user.id),
      });

      if (existing) return existing;

      await db
        .update(schema.user)
        .set({ role: "scholar", updatedAt: new Date() })
        .where(eq(schema.user.id, ctx.session.user.id));

      const [profile] = await db
        .insert(schema.scholarProfile)
        .values({
          id: generateProfileId("schol"),
          userId: ctx.session.user.id,
          ...input,
          isApproved: false,
          isAvailable: false,
        })
        .returning();

      return profile!;
    }),

  /**
   * Bolsista alterna sua disponibilidade.
   * Apenas bolsistas aprovados podem ficar disponíveis.
   */
  toggleAvailability: scholarProcedure.mutation(async ({ ctx }) => {
    const profile = await db.query.scholarProfile.findFirst({
      where: eq(schema.scholarProfile.userId, ctx.session.user.id),
    });

    if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

    if (!profile.isApproved) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Seu cadastro ainda não foi aprovado pelo NAC. Aguarde a aprovação para ativar a disponibilidade.",
      });
    }

    const [updated] = await db
      .update(schema.scholarProfile)
      .set({
        isAvailable: !profile.isAvailable,
        updatedAt: new Date(),
      })
      .where(eq(schema.scholarProfile.id, profile.id))
      .returning();

    return updated!;
  }),

  // ─── Rotas do gestor ──────────────────────────────────────────────────────

  /**
   * Lista todos os bolsistas pendentes de aprovação.
   */
  pendingScholars: managerProcedure.query(async () => {
    return db.query.scholarProfile.findMany({
      where: eq(schema.scholarProfile.isApproved, false),
      with: { user: true },
      orderBy: (t, { asc }) => [asc(t.createdAt)],
    });
  }),

  /**
   * Aprova ou rejeita um bolsista.
   * Rejeitar = desativar o perfil (isActive: false).
   */
  reviewScholar: managerProcedure
    .input(
      z.object({
        scholarProfileId: z.string(),
        approved: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await db.query.scholarProfile.findFirst({
        where: eq(schema.scholarProfile.id, input.scholarProfileId),
        with: { user: true },
      });

      if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

      const now = new Date();

      const [updated] = await db
        .update(schema.scholarProfile)
        .set({
          isApproved: input.approved,
          isActive: input.approved,
          approvedAt: input.approved ? now : null,
          approvedBy: input.approved ? ctx.session.user.id : null,
          updatedAt: now,
        })
        .where(eq(schema.scholarProfile.id, input.scholarProfileId))
        .returning();

      // Notificação via realtime para o bolsista
      await ctx.realtime.publish(
        `user:${profile.userId}`,
        input.approved ? "scholar:approved" : "scholar:rejected",
        { scholarProfileId: input.scholarProfileId },
      );

      return updated!;
    }),
});
