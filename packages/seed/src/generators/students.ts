/**
 * Generator de perfis de estudante.
 *
 * Para cada usuário com role="student", cria:
 * - student_profile (dados acadêmicos e pessoais)
 * - student_disability (tipos de deficiência, 1-3 por estudante)
 * - favorite_route (rotas frequentes, 0-2 por estudante)
 */

import {
	campusValues,
	courseValues,
	disabilityTypeValues,
	genderValues,
	studentShiftValues,
} from "@mobiliza/contracts";
import type {
	NewFavoriteRoute,
	NewStudentDisability,
	NewStudentProfile,
} from "@mobiliza/db/schema";
import {
	campusLocation,
	favoriteRoute,
	studentDisability,
	studentProfile,
	user,
} from "@mobiliza/db/schema";

import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

import { db } from "../lib/db";
import { faker, generateEnrollment, generatePhone } from "../lib/faker";
import { pickTwoDistinct } from "../lib/helpers";
import type { SeedContext, SeedGenerator } from "../lib/types";

// ─── Generator ────────────────────────────────────────────────────────────────

export const studentGenerator: SeedGenerator = {
	name: "students",
	dependencies: ["users"],

	async generate(ctx: SeedContext): Promise<void> {
		// Pula se já existirem perfis de estudante (idempotência)
		const existing = await db
			.select({ id: studentProfile.id })
			.from(studentProfile)
			.limit(1);
		if (existing.length > 0) {
			ctx.counters[this.name] = 0;
			return;
		}

		// 1. Buscar usuários com role student
		const studentUsers = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.role, "student"));

		if (studentUsers.length === 0) {
			return;
		}

		// 2. Buscar localizações existentes (para favorite_routes)
		const locations = await db
			.select({ id: campusLocation.id })
			.from(campusLocation);

		if (locations.length < 2) {
			// Precisa de ao menos 2 localizações para rotas
			return;
		}

		// 3. Gerar perfis
		const profiles = studentUsers.map((su) => {
			const profile = generateStudentProfile(su.id);
			return {
				studentId: su.id,
				profile,
				disabilities: generateDisabilities(profile.id),
				favoriteRoutes: generateFavoriteRoutes(
					profile.id,
					locations.map((l) => l.id),
				),
			};
		});

		// 4. Inserir em batch
		const profileRows = profiles.map((p) => p.profile);
		await db.insert(studentProfile).values(profileRows);

		// 5. Inserir disabilities (pode gerar vários por estudante)
		const disabilityRows = profiles.flatMap((p) => p.disabilities);
		if (disabilityRows.length > 0) {
			await db.insert(studentDisability).values(disabilityRows);
		}

		// 6. Inserir favorite routes
		const routeRows = profiles.flatMap((p) => p.favoriteRoutes);
		if (routeRows.length > 0) {
			await db.insert(favoriteRoute).values(routeRows);
		}

		ctx.counters[this.name] = profileRows.length;
		ctx.counters[`${this.name}.disabilities`] = disabilityRows.length;
		ctx.counters[`${this.name}.favorites`] = routeRows.length;
	},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateStudentProfile(userId: string): NewStudentProfile {
	return {
		id: uuidv7(),
		userId,
		enrollment: generateEnrollment(),
		course: faker.helpers.arrayElement([...courseValues]),
		campus: faker.helpers.arrayElement([...campusValues]),
		phone: generatePhone(),
		shift: faker.helpers.arrayElement([...studentShiftValues]),
		gender: faker.helpers.arrayElement([...genderValues]),
		nickname: faker.datatype.boolean(0.3) ? faker.person.firstName() : null,
		attendanceNotes: faker.datatype.boolean(0.4)
			? faker.helpers.arrayElement([
				"Prefere acompanhamento pelo lado direito",
				"Usa cadeira de rodas elétrica",
				"Precisa de apoio para subir rampas",
				"Comunicação por Libras",
				"Sensibilidade a luz forte — usar óculos escuros",
				"Cão-guida acompanha",
				"Prefere esperar em local coberto",
				"Tem mobilidade reduzida no lado esquerdo",
			])
			: null,
		simplifiedInterface: faker.datatype.boolean(0.2),
		voiceProcessingOnline: faker.datatype.boolean(0.8),
		isActive: faker.datatype.boolean(0.9),
	};
}

function generateDisabilities(
	studentProfileId: string,
): NewStudentDisability[] {
	const numDisabilities = faker.number.int({ min: 1, max: 3 });
	const shuffled = faker.helpers.shuffle([...disabilityTypeValues]);
	const selected = shuffled.slice(0, numDisabilities);

	return selected.map((disabilityType) => ({
		id: uuidv7(),
		studentProfileId,
		disabilityType,
	}));
}

function generateFavoriteRoutes(
	studentProfileId: string,
	locationIds: string[],
): NewFavoriteRoute[] {
	const numRoutes = faker.number.int({ min: 0, max: 2 });
	if (numRoutes === 0) return [];

	const routes: NewFavoriteRoute[] = [];

	for (let i = 0; i < numRoutes; i++) {
		const [origin, destination] = pickTwoDistinct(locationIds);

		const name = faker.helpers.arrayElement([
			"Casa → IC",
			"IC → RU",
			"Campus → Casa",
			"Biblioteca → IC",
			"Ponto de ônibus → Sala",
			"RU → Biblioteca",
			"IC → Biblioteca",
		]);

		routes.push({
			id: uuidv7(),
			studentProfileId,
			originLocationId: origin,
			destinationLocationId: destination,
			name,
		});
	}

	return routes;
}
