/**
 * Utilitários compartilhados entre os generators do seeder.
 */

import { faker } from "./faker";

/**
 * Seleciona dois elementos distintos de um array usando o Faker para
 * garantir reprodutibilidade com a seed configurada.
 *
 * O array deve ter ao menos 2 elementos — a validação é responsabilidade
 * do caller.
 *
 * Uso:
 *   const [a, b] = pickTwoDistinct(locationIds);
 */
export function pickTwoDistinct<T>(arr: readonly T[]): [T, T] {
	const shuffled = faker.helpers.shuffle([...arr]);
	// biome-ignore lint/style/noNonNullAssertion: garantido por validação no caller
	return [shuffled[0]!, shuffled[1]!];
}
