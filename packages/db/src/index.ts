/**
 * @mobiliza/db
 *
 * Pacote de banco de dados do Mobiliza.
 * Exporta o cliente Drizzle, a instância do Better Auth e todos os schemas.
 *
 * Uso no backend:
 *   import { db, auth } from "@mobiliza/db"
 *   import { serviceRequest, studentProfile } from "@mobiliza/db/schema"
 */

export { db } from "./client";
export type { Database } from "./client";

export { auth } from "./auth";
export type { Auth } from "./auth";

export * from "./schema";
