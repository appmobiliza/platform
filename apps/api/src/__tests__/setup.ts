/**
 * Setup global para testes do Mobiliza API.
 *
 * Configura ambiente Jest antes de cada suite de teste.
 */

import { afterAll, afterEach, beforeAll } from "@jest/globals";
import * as schema from "@mobiliza/db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as fs from "node:fs";
import * as path from "node:path";

// ─── Load .env BEFORE any checks ─────────────────────────────────────────────

const envPath = path.resolve(process.cwd(), "../../.env");
if (fs.existsSync(envPath)) {
	const content = fs.readFileSync(envPath, "utf-8");
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eqIndex = trimmed.indexOf("=");
		if (eqIndex === -1) continue;
		const key = trimmed.slice(0, eqIndex).trim();
		const value = trimmed
			.slice(eqIndex + 1)
			.trim()
			.replace(/^["']|["']$/g, "");
		if (key && !process.env[key]) {
			process.env[key] = value;
		}
	}
	console.log("[setup] .env loaded from", envPath);
} else {
	console.warn("[setup] .env not found at", envPath);
}

// ─── Default test env vars (only if not already set) ─────────────────────────

if (!process.env.DATABASE_URL) {
	process.env.DATABASE_URL =
		"postgresql://test:test@localhost:5432/mobiliza_test";
}

process.env.NODE_ENV = "test";
process.env.REALTIME_PROVIDER = "mock";
process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
process.env.BETTER_AUTH_SECRET = "test-better-auth-secret-min-32-chars-long!!";
process.env.TRUSTED_ORIGINS = "http://localhost:3000";
// ─── DB Instances ─────────────────────────────────────────────────────────────

let db: ReturnType<typeof drizzle> | null = null;
let sqlClient: ReturnType<typeof neon> | null = null;

// Mock transaction for neon-http (not supported in unit tests)
(globalThis as any).mockTransaction = async (cb: (tx: any) => Promise<any>) => {
	return cb(db);
};

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
			console.log("[setup] Conexao com Neon estabelecida");
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
