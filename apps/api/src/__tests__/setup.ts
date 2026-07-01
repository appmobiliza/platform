/**
 * Setup global para testes do Mobiliza API.
 *
 * Configura ambiente Jest antes de cada suite de teste.
 */

import "./mocks/env-loader";

import * as schema from "@mobiliza/db/schema";

import { afterAll, afterEach, beforeAll } from "@jest/globals";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// ─── DB Instances ─────────────────────────────────────────────────────────────

let db: ReturnType<typeof drizzle> | null = null;
let sqlClient: ReturnType<typeof neon> | null = null;

/**
 * Conecta ao banco Neon e cria instância Drizzle.
 * Retry 3x com delay de 1s se falhar.
 */
async function setupDatabase(): Promise<void> {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL nao definida");
	}

	const maxAttempts = 3;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			sqlClient = neon(process.env.DATABASE_URL);
			db = drizzle(sqlClient, { schema });
			// Test connection with a simple query
			await sqlClient`SELECT 1`;
			return;
		} catch (error) {
			console.warn(
				`[setup] Tentativa ${attempt}/${maxAttempts} falhou:`,
				error,
			);
			sqlClient = null;
			db = null;
			if (attempt < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}
	}

	throw new Error("[setup] Falha ao conectar ao Neon apos 3 tentativas");
}

/**
 * Cleanup após cada teste - deleta APENAS dados das tabelas de domínio.
 *
 * ⚠️ NÃO deleta tabelas do Better Auth (user, session, account, verification)
 * pois podem conter dados reais de outros testes ou produção.
 */
async function rollbackTransaction(): Promise<void> {
	if (!sqlClient) {
		throw new Error("DB not connected");
	}

	try {
		// Test data cleanup - delete all tables including Better Auth users created in tests
		await sqlClient`DELETE FROM notification`;
		await sqlClient`DELETE FROM service_attendance`;
		await sqlClient`DELETE FROM service_request`;
		await sqlClient`DELETE FROM student_disability`;
		await sqlClient`DELETE FROM student_profile`;
		await sqlClient`DELETE FROM scholar_profile`;
		await sqlClient`DELETE FROM campus_location`;
		await sqlClient`DELETE FROM "user"`;
	} catch {
		// Ignora erros durante cleanup
	}
}

/**
 * Fecha conexão com o banco.
 */
async function closeDatabase(): Promise<void> {
	sqlClient = null;
	db = null;
}

/**
 * Retorna instância do banco para queries diretas.
 */
export function getDb() {
	if (!db) {
		throw new Error("DB not initialized - call setupDatabase() first");
	}
	return db;
}

// ─── Jest Hooks ───────────────────────────────────────────────────────────────

beforeAll(async () => {
	await setupDatabase();
});

afterAll(async () => {
	await closeDatabase();
});

afterEach(async () => {
	await rollbackTransaction();
});

// Re-export for convenience
export { closeDatabase, rollbackTransaction };
