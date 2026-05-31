#!/usr/bin/env tsx
/**
 * @mobiliza/seed — Seeder de dados de teste para o Mobiliza.
 *
 * Uso:
 *   pnpm seed                                        # Executa com defaults
 *   pnpm seed:reset                                  # Limpa banco + seed
 *   tsx src/index.ts --students=10 --scholars=5      # Customizado
 *   tsx src/index.ts --seed=42 --reset               # Determinístico + reset
 */

import { logError, parseCLIArgs, SeedRunner } from "./lib/seed";

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
	const cliOverrides = parseCLIArgs(process.argv.slice(2));
	const runner = new SeedRunner(cliOverrides);
	await runner.run();
}

// ─── Execução ─────────────────────────────────────────────────────────────────

main().catch((err) => {
	logError("Falha fatal no seeder", err);
	process.exit(1);
});
