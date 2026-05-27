import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { protectedProcedure } from "../../trpc/context";

export const rate = protectedProcedure
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
  });
