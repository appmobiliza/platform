import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { RequestRecord } from "@mobiliza/contracts";
import type { RequestRepository } from "@mobiliza/domain";
import { requests as requestsTable } from "./schema.js";
import * as schema from "./schema.js";

export function createRequestRepository(db: PostgresJsDatabase<typeof schema>): RequestRepository {
  return {
    async list(): Promise<RequestRecord[]> {
      const records = await db.select().from(requestsTable);

      return records.map((record) => ({
        id: record.id,
        studentId: record.studentId,
        origin: record.origin,
        destination: record.destination,
        notes: record.notes ?? undefined,
        status: record.status as RequestRecord["status"],
        assignedAssistantId: record.assignedAssistantId ?? undefined,
        requestedAt: record.requestedAt.toISOString(),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      }));
    },

    async create(request: RequestRecord): Promise<RequestRecord> {
      const inserted = await db
        .insert(requestsTable)
        .values({
          id: request.id,
          studentId: request.studentId,
          origin: request.origin,
          destination: request.destination,
          notes: request.notes ?? null,
          status: request.status,
          assignedAssistantId: request.assignedAssistantId ?? null,
          requestedAt: new Date(request.requestedAt),
          createdAt: new Date(request.createdAt),
          updatedAt: new Date(request.updatedAt),
        })
        .returning();

      const record = inserted[0];

      if (!record) {
        throw new Error("Failed to create request record");
      }

      return {
        id: record.id,
        studentId: record.studentId,
        origin: record.origin,
        destination: record.destination,
        notes: record.notes ?? undefined,
        status: record.status as RequestRecord["status"],
        assignedAssistantId: record.assignedAssistantId ?? undefined,
        requestedAt: record.requestedAt.toISOString(),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    },
  };
}