/**
 * Tipos e interfaces para configuração do seeder.
 */

/**
 * Configuração geral do seeder.
 * Define quantos registros de cada entidade serão gerados.
 *
 * Valores padrão (configuração "Médio"):
 * - 25 estudantes
 * - 10 bolsistas
 * - 3 gestores
 * - 15 localizações
 * - 50 solicitações
 */
export interface SeedConfig {
	/** Número de estudantes a criar (com perfis + usuários) */
	totalStudents?: number;

	/** Número de bolsistas a criar (com perfis + usuários) */
	totalScholars?: number;

	/** Número de gestores NAC a criar (usuários com role manager) */
	totalManagers?: number;

	/** Número de pontos de localização no campus */
	totalLocations?: number;

	/** Número de solicitações de deslocamento a gerar */
	totalRequests?: number;

	/** Seed do Faker para reprodutibilidade (padrão: 42) */
	fakerSeed?: number;

	/** Se true, limpa todas as tabelas antes de semear */
	reset?: boolean;
}

/**
 * Contador interno para rastrear quantos registros de cada tipo
 * foram inseridos durante a execução do seeder.
 */
export type SeedCounters = Record<string, number>;

/**
 * Contexto completo passado para cada generator.
 * Contém acesso ao banco, faker e configuração.
 */
export interface SeedContext {
	/** Configuração ativa do seeder */
	config: Required<SeedConfig>;
	/** Contadores de registros inseridos */
	counters: SeedCounters;
}

/**
 * Interface que todo generator deve implementar.
 */
export interface SeedGenerator {
	/** Nome legível do generator (ex: "students") */
	readonly name: string;

	/** Dependências — nomes de generators que precisam rodar antes */
	readonly dependencies?: string[];

	/** Executa a geração dos dados */
	generate(ctx: SeedContext): Promise<void>;
}
