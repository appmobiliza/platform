import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { RequestRepository } from "@mobiliza/domain";
import { getDatabaseUrl } from "./env.js";
import { createRequestRepository } from "./repositories.js";
import * as schema from "./schema.js";

export interface DatabaseClient {
  requests: RequestRepository;
  db: ReturnType<typeof drizzle>;
  connection: ReturnType<typeof postgres>;
}

let clientInstance: DatabaseClient | null = null;

export function createDatabase(): DatabaseClient {
  const databaseUrl = getDatabaseUrl();
  const connection = postgres(databaseUrl);
  const db = drizzle(connection, { schema });

  return {
    requests: createRequestRepository(db),
    db,
    connection,
  };
}

export function getDatabaseClient(): DatabaseClient {
  if (!clientInstance) {
    clientInstance = createDatabase();
  }

  return clientInstance;
}

export async function closeDatabase(): Promise<void> {
  if (clientInstance) {
    await clientInstance.connection.end();
    clientInstance = null;
  }
}