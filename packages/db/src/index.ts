/**
 * @mobiliza/db
 *
 * Pacote de banco de dados do Mobiliza.
 * Exporta o cliente Drizzle e todos os schemas.
 *
 * Uso no backend:
 *   import { db } from "@mobiliza/db"
 *   import { serviceRequest, studentProfile } from "@mobiliza/db/schema"
 */
export type { Database } from "./client";
export { db } from "./client";
export * from "./drizzle";
export * from "./schema";
