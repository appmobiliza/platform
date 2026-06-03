/**
 * Conexão com o banco de dados para o seeder.
 *
 * Reutiliza o cliente Drizzle do pacote @mobiliza/db.
 */

import { db as drizzleDb } from "@mobiliza/db";

/**
 * Instância do banco Drizzle pronta para uso nos seeders.
 *
 * Uso:
 *   import { db } from "../lib/db";
 *   await db.insert(users).values([...]);
 */
export const db = drizzleDb;
