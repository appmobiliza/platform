/**
 * Generator de perfis de bolsista (NAC).
 *
 * Para cada usuário com role="scholar", cria um registro em scholar_profile
 * com dados acadêmicos, CPF e status de aprovação.
 *
 * Aproximadamente 70% dos bolsistas são aprovados pela coordenação,
 * e destes, ~60% estão marcados como disponíveis.
 */

import { campusValues, courseValues, scholarShiftValues } from "@mobiliza/contracts";
import type { NewScholarProfile } from "@mobiliza/db/schema";
import {
	scholarProfile,
	user,
} from "@mobiliza/db/schema";
import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

import { db } from "../lib/db";
import {
	faker,
	generateCPF,
	generateEnrollment,
	generatePhone,
} from "../lib/faker";
import type { SeedContext, SeedGenerator } from "../lib/types";

// ─── Generator ────────────────────────────────────────────────────────────────

export const scholarGenerator: SeedGenerator = {
	name: "scholars",
	dependencies: ["users"],

	async generate(ctx: SeedContext): Promise<void> {
		// Pula se já existirem perfis de bolsista (idempotência)
		const existing = await db
			.select({ id: scholarProfile.id })
			.from(scholarProfile)
			.limit(1);
		if (existing.length > 0) {
			ctx.counters[this.name] = 0;
			return;
		}

		// 1. Buscar usuários com role scholar
		const scholarUsers = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.role, "scholar"));

		if (scholarUsers.length === 0) {
			return;
		}

		// 2. Gerar perfis
		const profiles = scholarUsers.map((su) =>
			generateScholarProfile(su.id),
		);

		// 3. Inserir em batch
		await db.insert(scholarProfile).values(profiles);

		const approved = profiles.filter((p) => p.isApproved).length;
		ctx.counters[this.name] = profiles.length;
		ctx.counters[`${this.name}.approved`] = approved;
	},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateScholarProfile(userId: string): NewScholarProfile {
	const now = new Date();
	const isApproved = faker.datatype.boolean(0.7);
	const isAvailable = isApproved ? faker.datatype.boolean(0.6) : false;

	const createdAt = new Date(
		now.getTime() -
			faker.number.int({ min: 1, max: 60 }) * 24 * 60 * 60 * 1000,
	);

	return {
		id: uuidv7(),
		userId,
		enrollment: generateEnrollment(),
		course: faker.helpers.arrayElement([...courseValues]),
		campus: faker.helpers.arrayElement([...campusValues]),
		phone: generatePhone(),
		cpf: generateCPF(),
		shift: faker.helpers.arrayElement([...scholarShiftValues]),
		isApproved,
		approvedAt: isApproved
			? new Date(
					createdAt.getTime() +
						faker.number.int({ min: 1, max: 5 }) *
							24 *
							60 *
							60 *
							1000,
				)
			: null,
		approvedBy: null, // será vinculado a um manager quando o generator de managers existir
		isAvailable,
		isActive: faker.datatype.boolean(0.9),
	};
}
