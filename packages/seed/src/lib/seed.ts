/**
 * SeedRunner — Núcleo de orquestração do seeder.
 *
 * Responsabilidades:
 * 1. Carregar config (CLI args + defaults)
 * 2. Resetar banco (opcional)
 * 3. Executar generators na ordem correta
 * 4. Logar progresso e resultados
 */

import { sql } from "drizzle-orm";

import { db } from "./db";
import { setFakerSeed } from "./faker";
import type {
	SeedConfig,
	SeedContext,
	SeedCounters,
	SeedGenerator,
} from "./types";

// ─── Configuração Padrão ──────────────────────────────────────────────────────

export const DEFAULT_SEED_CONFIG: Required<SeedConfig> = {
	totalStudents: 25,
	totalScholars: 10,
	totalManagers: 3,
	totalLocations: 15,
	totalRequests: 50,
	fakerSeed: 42,
	reset: false,
};

// ─── Logger ───────────────────────────────────────────────────────────────────

/**
 * Prefixo de timestamp para logs do seeder.
 *
 * Uso:
 *   log("Inserindo estudantes...");
 *   // Saída: [10:30:45] Inserindo estudantes...
 */
export function log(message: string): void {
	const timestamp = new Date().toLocaleTimeString("pt-BR");
	console.log(`[${timestamp}] ${message}`);
}

/**
 * Log de erro com timestamp.
 */
export function logError(message: string, error?: unknown): void {
	const timestamp = new Date().toLocaleTimeString("pt-BR");
	console.error(`[${timestamp}] ❌ ${message}`, error ?? "");
}

/**
 * Log de sucesso com timestamp.
 */
export function logSuccess(message: string): void {
	const timestamp = new Date().toLocaleTimeString("pt-BR");
	console.log(`[${timestamp}] ✅ ${message}`);
}

/**
 * Log de aviso com timestamp.
 */
export function logWarn(message: string): void {
	const timestamp = new Date().toLocaleTimeString("pt-BR");
	console.warn(`[${timestamp}] ⚠️ ${message}`);
}

// ─── Parse de CLI ─────────────────────────────────────────────────────────────

/**
 * Parseia argumentos da linha de comando para extrair --flags.
 *
 * Suporta:
 *   --reset
 *   --seed=42
 *   --students=30
 *   --scholars=5
 *
 * Flags sem valor são tratadas como boolean (true se presentes).
 */
export function parseCLIArgs(args: string[]): Partial<SeedConfig> {
	const config: Partial<SeedConfig> = {};

	for (const arg of args) {
		if (arg === "--reset") {
			config.reset = true;
			continue;
		}

		const match = arg.match(/^--(\w+)=(.+)$/);
		if (match) {
			const key = match[1] as string | undefined;
			const value = match[2] as string | undefined;
			if (!key || !value) continue;

			switch (key) {
				case "seed":
					config.fakerSeed = Number.parseInt(value, 10);
					break;
				case "students":
					config.totalStudents = Number.parseInt(value, 10);
					break;
				case "scholars":
					config.totalScholars = Number.parseInt(value, 10);
					break;
				case "managers":
					config.totalManagers = Number.parseInt(value, 10);
					break;
				case "locations":
					config.totalLocations = Number.parseInt(value, 10);
					break;
				case "requests":
					config.totalRequests = Number.parseInt(value, 10);
					break;
			}
		}
	}

	return config;
}

// ─── SeedRunner ───────────────────────────────────────────────────────────────

/**
 * Orquestrador principal do seeder.
 *
 * Uso:
 *   const runner = new SeedRunner();
 *   await runner.run();
 *
 *   // Com config customizada:
 *   const runner = new SeedRunner({ totalStudents: 10, reset: true });
 *   await runner.run();
 */
export class SeedRunner {
	private config: Required<SeedConfig>;
	private counters: SeedCounters = {};
	private startTime = 0;
	private generators: SeedGenerator[] = [];

	constructor(config?: Partial<SeedConfig>) {
		this.config = { ...DEFAULT_SEED_CONFIG, ...config };
	}

	/**
	 * Retorna a configuração ativa (read-only).
	 */
	getConfig(): Readonly<Required<SeedConfig>> {
		return this.config;
	}

	/**
	 * Retorna os contadores atuais.
	 */
	getCounters(): Readonly<SeedCounters> {
		return { ...this.counters };
	}

	/**
	 * Obtém o contexto atual para passar aos generators.
	 */
	getContext(): SeedContext {
		return {
			config: this.config,
			counters: this.counters,
		};
	}

	/**
	 * Incrementa um contador nomeado.
	 */
	incrementCounter(name: string, amount = 1): void {
		this.counters[name] = (this.counters[name] ?? 0) + amount;
	}

	/**
	 * Registra um generator para execução.
	 */
	register(generator: SeedGenerator): void {
		this.generators.push(generator);
	}

	/**
	 * Registra múltiplos generators de uma vez.
	 * A ordem do array determina a ordem de execução.
	 */
	registerAll(generators: SeedGenerator[]): void {
		this.generators.push(...generators);
	}

	/**
	 * Ponto de entrada principal: prepara o ambiente e executa os generators.
	 */
	async run(): Promise<void> {
		this.startTime = Date.now();

		log("🚀 Iniciando seeder do Mobiliza");
		log(`Config: ${JSON.stringify(this.config, null, 2)}`);

		// ── 1. Seed do Faker ──────────────────────────────────────────────
		setFakerSeed(this.config.fakerSeed);
		log(`Faker seed: ${this.config.fakerSeed}`);

		// ── 2. Reset (opcional) ───────────────────────────────────────────
		if (this.config.reset) {
			await this.reset();
		}

		// ── 3. Executar generators ───────────────────────────────────────
		if (this.generators.length === 0) {
			logWarn("Nenhum generator registrado.");
		} else {
			log(`\n${"─".repeat(40)}`);
			log("Executando generators:");

			for (const gen of this.generators) {
				log(`\n▶️  Generator: ${gen.name}`);
				const genStart = Date.now();

				try {
					await gen.generate(this.getContext());
					const elapsed = ((Date.now() - genStart) / 1000).toFixed(2);

					const genCounters = Object.entries(this.counters)
						.filter(
							([key]) =>
								key.startsWith(`${gen.name}.`) ||
								key === gen.name,
						)
						.map(([key, val]) => `${key}=${val}`)
						.join(", ");

					logSuccess(
						`${gen.name} concluído (${elapsed}s) — ${genCounters}`,
					);
				} catch (err) {
					logError(`Falha no generator "${gen.name}"`, err);
					throw err;
				}
			}
		}

		// ── 4. Sumário ──────────────────────────────────────────────────
		this.printSummary();
	}

	/**
	 * Limpa todas as tabelas do banco (TRUNCATE em cascata).
	 *
	 * Ordem respeita as foreign keys: primeiro tabelas que dependem,
	 * depois tabelas referenciadas.
	 */
	async reset(): Promise<void> {
		log("Limpando banco de dados...");

		const tables = [
			// Tabelas folha (sem dependentes)
			"audio_message",
			"notification",
			"favorite_route",
			"service_attendance",
			// Tabelas intermediárias
			"student_disability",
			"service_request",
			// Tabelas pai (referenciadas)
			"student_profile",
			"scholar_profile",
			"campus_location",
			// Auth (Better Auth)
			"session",
			"account",
			"verification",
			"user",
		];

		for (const table of tables) {
			try {
				await db.execute(
					sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`,
				);
				log(`  ↳ ${table}: limpa`);
			} catch (err) {
				logWarn(
					`  ↳ ${table}: erro ao limpar (pode não existir) — ${err}`,
				);
			}
		}

		logSuccess("Banco limpo com sucesso");
	}

	/**
	 * Imprime o sumário da execução.
	 */
	private printSummary(): void {
		const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
		const total = Object.values(this.counters).reduce((a, b) => a + b, 0);

		log("─".repeat(40));
		logSuccess(`Seed concluído em ${elapsed}s`);
		log(`Total de registros inseridos: ${total}`);

		if (Object.keys(this.counters).length > 0) {
			log("\nDetalhamento:");
			for (const [key, value] of Object.entries(this.counters)) {
				log(`  • ${key}: ${value}`);
			}
		}

		log("─".repeat(40));
	}
}
