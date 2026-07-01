/**
 * Setup global para testes do Mobiliza API.
 *
 * Configura ambiente Jest antes de cada suite de teste.
 */

import "./mocks/env-loader";

import { afterAll, afterEach, beforeAll } from "@jest/globals";
import { neon } from "@neondatabase/serverless";

// ─── DB Instance ─────────────────────────────────────────────────────────────

let sqlClient: ReturnType<typeof neon<false, false>> | null = null;

/**
 * Conecta ao banco Neon.
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
			// Test connection with a simple query
			await sqlClient`SELECT 1`;
			return;
		} catch (error) {
			console.warn(
				`[setup] Tentativa ${attempt}/${maxAttempts} falhou:`,
				error,
			);
			sqlClient = null;
			if (attempt < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}
	}

	throw new Error("[setup] Falha ao conectar ao Neon apos 3 tentativas");
}

/**
 * Cleanup após cada teste — TRUNCA todas as tabelas do banco via CASCADE.
 */
async function rollbackTransaction(): Promise<void> {
	if (!sqlClient) {
		throw new Error("DB not connected");
	}

	const result = await sqlClient`
			SELECT tablename
			FROM pg_tables
			WHERE schemaname = 'public'
		`;

	const quotedTables = result.map((r) => `"${r.tablename}"`).join(", ");

	if (quotedTables) {
		await sqlClient`TRUNCATE TABLE ${sqlClient.unsafe(quotedTables)} CASCADE`;
	}
}

/**
 * Fecha conexão com o banco.
 */
async function closeDatabase(): Promise<void> {
	sqlClient = null;
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
export { rollbackTransaction };
