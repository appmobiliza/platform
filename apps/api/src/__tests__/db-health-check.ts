/**
 * Health check script for Neon database.
 *
 * Tests connectivity, schema existence, and basic query execution.
 *
 * Usage:
 *   cd apps/api && npx tsx src/__tests__/db-health-check.ts
 */

import { neon } from "@neondatabase/serverless";

import * as fs from "node:fs";
import * as path from "node:path";

// ─── Env Loading ───────────────────────────────────────────────────────────────

function loadEnvFile(): void {
	// Go up 2 levels from apps/api/src/__tests__ to project root
	const envPath = path.resolve(process.cwd(), "../../.env");
	if (!fs.existsSync(envPath)) {
		throw new Error(`.env not found at ${envPath}`);
	}
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
		if (key) {
			process.env[key] = value;
		}
	}
}

// ─── Health Check ──────────────────────────────────────────────────────────────

interface HealthStatus {
	connected: boolean;
	schemaVerified: boolean;
	queryWorks: boolean;
	errors: string[];
	missingTables: string[];
}

const REQUIRED_TABLES = [
	// Auth (managed by Better Auth)
	"user",
	"session",
	// Domain tables
	"student_profile",
	"scholar_profile",
	"student_disability",
	"campus_location",
	"service_request",
	"service_attendance",
	"audio_message",
	"favorite_route",
	"notification",
];

async function checkDatabaseHealth(): Promise<HealthStatus> {
	const status: HealthStatus = {
		connected: false,
		schemaVerified: false,
		queryWorks: false,
		errors: [],
		missingTables: [],
	};

	if (!process.env.DATABASE_URL) {
		status.errors.push("DATABASE_URL not defined in .env");
		return status;
	}

	let sql: ReturnType<typeof neon>;

	// 1. Test connectivity
	try {
		sql = neon(process.env.DATABASE_URL);
		await sql`SELECT 1`;
		status.connected = true;
	} catch (error) {
		status.errors.push(
			`Connection failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return status;
	}

	// 2. Test basic query (version)
	try {
		const result = await sql`SELECT version()`;
		const rows = result as unknown as Array<{ version: string }>;
		const row = rows[0];
		console.log(`  Database: ${row?.version.split("\n")[0] ?? "unknown"}`);
		status.queryWorks = true;
	} catch (error) {
		status.errors.push(
			`Query failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		return status;
	}

	// 3. Check schema - verify required tables exist
	try {
		const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

		const tables = tablesResult as unknown as Array<{ table_name: string }>;
		const existingTables = new Set(tables.map((t) => t.table_name));
		const missing = REQUIRED_TABLES.filter((t) => !existingTables.has(t));

		if (missing.length > 0) {
			status.missingTables = missing;
			status.schemaVerified = false;
		} else {
			status.schemaVerified = true;
		}
	} catch (error) {
		status.errors.push(
			`Schema check failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	return status;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
	console.log("🔍 Mobiliza DB Health Check\n");

	// Load env
	try {
		loadEnvFile();
		console.log("✅ Environment loaded from .env");
	} catch (error) {
		console.log(
			`❌ Failed to load .env: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}

	// Run health check
	const status = await checkDatabaseHealth();

	// Report
	console.log("");

	if (status.connected) {
		console.log("✅ Database connected");
	} else {
		console.log("❌ Connection failed");
		status.errors.forEach((e) => console.log(`   Error: ${e}`));
	}

	if (status.queryWorks) {
		console.log("✅ Query execution works");
	}

	if (status.schemaVerified) {
		console.log("✅ Schema verified (all tables exist)");
	} else if (status.missingTables.length > 0) {
		console.log(`❌ Schema missing tables:`);
		status.missingTables.forEach((t) => console.log(`   - ${t}`));
	}

	if (status.errors.length > 0 && status.connected) {
		console.log("\n⚠️  Additional errors:");
		status.errors.forEach((e) => console.log(`   - ${e}`));
	}

	// Exit code
	const allGood =
		status.connected && status.schemaVerified && status.queryWorks;
	console.log(
		`\n${allGood ? "✅ All checks passed" : "❌ Health check failed"}`,
	);

	process.exit(allGood ? 0 : 1);
}

main().catch((error) => {
	console.error(
		`❌ Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
	);
	process.exit(1);
});
