/**
 * Generator de usuários.
 *
 * Cria registros na tabela `user` do Better Auth para todas as roles:
 * - student (estudante PcD)
 * - scholar (bolsista do NAC)
 * - manager (gestor/coordenação)
 *
 * Não cria perfis (student_profile, scholar_profile) — isso é responsabilidade
 * dos generators especializados.
 */

import { user } from "@mobiliza/db/schema";
import { uuidv7 } from "uuidv7";

import { db } from "../lib/db";
import { faker } from "../lib/faker";
import type { SeedContext, SeedGenerator } from "../lib/types";

// ─── Config ───────────────────────────────────────────────────────────────────

interface UserSeed {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	role: "student" | "scholar" | "manager";
	createdAt: Date;
	updatedAt: Date;
}

// ─── Generator ────────────────────────────────────────────────────────────────

export const userGenerator: SeedGenerator = {
	name: "users",
	dependencies: [],

	async generate(ctx: SeedContext): Promise<void> {
		const { totalStudents, totalScholars, totalManagers } = ctx.config;

		const seedUsers: UserSeed[] = [
			...generateRoleUsers(totalStudents, "student"),
			...generateRoleUsers(totalScholars, "scholar"),
			...generateRoleUsers(totalManagers, "manager"),
		];

		if (seedUsers.length === 0) {
			return;
		}

		// Insere em batch, ignorando duplicatas (email unique)
		const inserted = await db
			.insert(user)
			.values(seedUsers)
			.onConflictDoNothing()
			.returning({ id: user.id });

		ctx.counters[this.name] = inserted.length;
	},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateRoleUsers(
	count: number,
	role: "student" | "scholar" | "manager",
): UserSeed[] {
	const now = new Date();

	return Array.from({ length: count }, () => {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const fullName = `${firstName} ${lastName}`;

		// Gera email institucional
		const email = generateEmail(firstName, lastName);

		// Timestamps ligeiramente diferentes para parecer real
		const createdAt = new Date(
			now.getTime() -
				faker.number.int({ min: 0, max: 90 * 24 * 60 * 60 * 1000 }),
		);
		const updatedAt = new Date(
			createdAt.getTime() +
				faker.number.int({ min: 0, max: 30 * 24 * 60 * 60 * 1000 }),
		);

		return {
			id: uuidv7(),
			name: fullName,
			email,
			emailVerified:
				role === "manager" ? true : faker.datatype.boolean(0.7),
			role,
			createdAt,
			updatedAt,
		};
	});
}

/**
 * Gera email institucional no formato nome.sobrenome@ic.ufal.br.
 * Remove acentos e caracteres especiais.
 */
function generateEmail(firstName: string, lastName: string): string {
	const normalizedFirst = normalizeEmailName(firstName);
	const normalizedLast = normalizeEmailName(lastName);

	const separator = faker.helpers.arrayElement([".", "_", ""] as const);
	const localPart = `${normalizedFirst}${separator}${normalizedLast}`;

	// Alguns emails usam domínios variados para parecer real
	const domain = faker.helpers.arrayElement([
		"ic.ufal.br",
		"ufal.br",
		"arapiraca.ufal.br",
	] as const);

	return `${localPart}@${domain}`;
}

/**
 * Remove acentos e caracteres especiais, converte para lowercase.
 */
function normalizeEmailName(name: string): string {
	return name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // remove acentos
		.replace(/[^a-zA-Z0-9]/g, "")
		.toLowerCase();
}
