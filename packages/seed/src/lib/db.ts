/**
 * Conexão com o banco de dados para o seeder.
 *
 * Reutiliza o cliente Drizzle do pacote @mobiliza/db,
 * que já carrega dotenv e configura a conexão com Neon.
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

/**
 * Retorna a instância do banco — útil para lazy loading ou injeção.
 */
export function getDb(): typeof db {
	return db;
}
