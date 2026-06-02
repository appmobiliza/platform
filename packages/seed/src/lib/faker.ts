/**
 * Instância global do Faker configurada para o contexto brasileiro.
 *
 * O locale pt_BR gera dados culturalmente apropriados (CPF, telefone,
 * endereço, nome) para os seeders do Mobiliza.
 */

import { faker as fakerEN } from "@faker-js/faker";
import { faker as fakerBR } from "@faker-js/faker/locale/pt_BR";

/**
 * Instância do Faker com locale pt_BR.
 * Gera nomes, endereços, telefones e outros dados no formato brasileiro.
 */
export const faker = fakerBR;

/**
 * Função para definir uma seed fixa e garantir reprodutibilidade
 * nos dados gerados. Útil para testes e debug.
 *
 * Uso:
 *   setFakerSeed(42); // dados determinísticos
 *   setFakerSeed();   // aleatório (Date.now())
 */
export function setFakerSeed(seed?: number): void {
	const resolved = seed ?? Date.now();
	fakerEN.seed(resolved);
	fakerBR.seed(resolved);
}

/**
 * Gera um CPF válido (apenas números) com dígitos verificadores computados.
 *
 * O algoritmo segue a legislação brasileira:
 *   1. Gera 9 dígitos aleatórios
 *   2. Computa DV1 (10º dígito) usando pesos 10→2
 *   3. Computa DV2 (11º dígito) usando pesos 11→2
 *
 * @see https://geradorcpf.com/algoritmo_do_cpf.htm
 */
export function generateCPF(): string {
	const base = faker.string.numeric({ length: 9, allowLeadingZeros: true });
	const digits = base.split("").map(Number);

	// Primeiro dígito verificador (pesos 10 → 2)
	const dv1 = computeCheckDigit(digits, 10);

	// Segundo dígito verificador (pesos 11 → 2, inclui dv1)
	const dv2 = computeCheckDigit([...digits, dv1], 11);

	return `${base}${dv1}${dv2}`;
}

/**
 * Computa um dígito verificador do CPF segundo o algoritmo oficial.
 *
 * @param digits  — dígitos-base (sem o DV a computar)
 * @param startWeight — peso inicial (10 para DV1, 11 para DV2)
 * @returns dígito verificador (0-9)
 */
function computeCheckDigit(digits: number[], startWeight: number): number {
	const sum = digits.reduce((acc, d, i) => acc + d * (startWeight - i), 0);
	const remainder = sum % 11;
	return remainder < 2 ? 0 : 11 - remainder;
}

/**
 * Gera uma matrícula no formato usado pela UFAL: 202XNNNNN.
 */
export function generateEnrollment(): string {
	const year = faker.number.int({ min: 2020, max: 2025 });
	const sequential = faker.string.numeric({
		length: 5,
		allowLeadingZeros: true,
	});
	return `${year}${sequential}`;
}

/**
 * Gera um número de telefone brasileiro no formato (XX) XXXXX-XXXX.
 */
export function generatePhone(): string {
	const ddd = faker.string.numeric({ length: 2, allowLeadingZeros: true });
	const prefix = faker.string.numeric({ length: 1, allowLeadingZeros: true });
	const suffix = faker.string.numeric({
		length: 7,
		allowLeadingZeros: false,
	});

	// Celular brasileiro: (DDD) 9XXXX-XXXX
	return `(${ddd}) 9${prefix}${suffix.slice(0, 4)}-${suffix.slice(4)}`;
}
