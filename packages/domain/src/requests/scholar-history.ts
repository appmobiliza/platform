import { z } from "zod";
import { PaginationSchema } from "@mobiliza/contracts";
import type { Database } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { ForbiddenError } from "../errors";

export async function getScholarHistory(
  input: z.infer<typeof PaginationSchema>,
  userId: string,
  db: Database
) {
  const scholarProfile = await db.query.scholarProfile.findFirst({
    where: eq(schema.scholarProfile.userId, userId),
  });

  if (!scholarProfile) {
    throw new ForbiddenError("Apenas bolsistas podem acessar este histórico.");
  }

  const items = await db.query.serviceAttendance.findMany({
    where: and(
      eq(schema.serviceAttendance.scholarProfileId, scholarProfile.id),
      input.cursor
        ? sql`${schema.serviceAttendance.id} < ${input.cursor}`
        : undefined
    ),
    with: {
      request: {
        with: {
          originLocation: true,
          destinationLocation: true,
          studentProfile: { with: { user: true } },
        },
      },
    },
    orderBy: [desc(schema.serviceAttendance.createdAt)],
    limit: input.limit + 1,
  });

  const hasMore = items.length > input.limit;
  const page = hasMore ? items.slice(0, input.limit) : items;

  // Calcula total de horas do bolsista (opcional, pode ser retornado junto)
  const totalDurationResult = await db
    .select({
      totalSeconds: sql<number>`sum(${schema.serviceAttendance.durationSeconds})`,
    })
    .from(schema.serviceAttendance)
    .where(eq(schema.serviceAttendance.scholarProfileId, scholarProfile.id));

  const totalDurationSeconds = Number(totalDurationResult[0]?.totalSeconds || 0);

  return {
    items: page,
    totalDurationSeconds,
    nextCursor: hasMore ? page[page.length - 1]?.id : undefined,
  };
}
