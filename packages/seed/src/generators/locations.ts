/**
 * Generator de localizações do campus.
 *
 * Cria pontos de referência fixos usados como origem/destino nas
 * solicitações de deslocamento. Gera uma mistura de locais reais
 * da UFAL (Campus A.C. Simões) com alguns genéricos adicionais.
 */

import { campusLocation } from "@mobiliza/db/schema";
import { uuidv7 } from "uuidv7";

import { db } from "../lib/db";
import { faker } from "../lib/faker";
import type { SeedGenerator } from "../lib/types";

// ─── Locais Predefinidos (UFAL Campus A.C. Simões) ───────────────────────────

interface PredefinedLocation {
	name: string;
	abbreviation: string;
	description: string;
	latitude: number;
	longitude: number;
}

const PREDEFINED_LOCATIONS: PredefinedLocation[] = [
	{
		name: "Instituto de Computação",
		abbreviation: "IC",
		description: "Bloco do Instituto de Computação — entrada principal",
		latitude: -9.5587,
		longitude: -35.7736,
	},
	{
		name: "Restaurante Universitário",
		abbreviation: "RU",
		description: "Restaurante Universitário — refeições gratuitas para PcD",
		latitude: -9.5579,
		longitude: -35.7741,
	},
	{
		name: "Biblioteca Central",
		abbreviation: "BC",
		description: "Biblioteca Central — rampa de acesso à direita",
		latitude: -9.5575,
		longitude: -35.7752,
	},
	{
		name: "Reitoria",
		abbreviation: "REI",
		description:
			"Prédio da Reitoria — entrada adaptada na lateral esquerda",
		latitude: -9.5568,
		longitude: -35.7758,
	},
	{
		name: "Hospital Universitário",
		abbreviation: "HU",
		description: "Hospital Universitário Professor Alberto Antunes",
		latitude: -9.5552,
		longitude: -35.7765,
	},
	{
		name: "Praça da Paz",
		abbreviation: "PP",
		description: "Praça da Paz — ponto de encontro central do campus",
		latitude: -9.5583,
		longitude: -35.7748,
	},
	{
		name: "Bloco de Salas de Aula",
		abbreviation: "BSA",
		description: "Conjunto de salas de aula — rampa no bloco B",
		latitude: -9.5591,
		longitude: -35.7731,
	},
	{
		name: "Centro de Tecnologia",
		abbreviation: "CTEC",
		description: "Centro de Tecnologia — laboratórios de engenharia",
		latitude: -9.5598,
		longitude: -35.7725,
	},
	{
		name: "Ginásio Poliesportivo",
		abbreviation: "GP",
		description: "Ginásio Poliesportivo — acesso pela Rua Lateral",
		latitude: -9.5565,
		longitude: -35.7729,
	},
	{
		name: "Portaria Principal",
		abbreviation: "PORT",
		description: "Portaria principal do campus — guarita de segurança",
		latitude: -9.5572,
		longitude: -35.7769,
	},
];

// ─── Categorias para Geração Aleatória ───────────────────────────────────────

const LOCATION_CATEGORIES = [
	{ prefix: "Bloco", suffix: "de Aulas" },
	{ prefix: "Laboratório de", suffix: "" },
	{ prefix: "Departamento de", suffix: "" },
	{ prefix: "Núcleo de", suffix: "" },
	{ prefix: "Coordenação de", suffix: "" },
] as const;

const LOCATION_SUBJECTS = [
	"Química",
	"Física",
	"Biologia",
	"Matemática",
	"História",
	"Geografia",
	"Letras",
	"Pedagogia",
	"Psicologia",
	"Farmácia",
	"Odontologia",
	"Direito",
	"Economia",
	"Administração",
	"Contabilidade",
	"Engenharia",
	"Artes",
	"Educação Física",
	"Enfermagem",
	"Medicina",
	"Nutrição",
	"Serviço Social",
	"Filosofia",
	"Sociologia",
];

// ─── Generator ────────────────────────────────────────────────────────────────

export const locationGenerator: SeedGenerator = {
	name: "locations",
	dependencies: [],

	async generate(ctx): Promise<void> {
		// Pula se já existirem localizações (idempotência)
		const existing = await db
			.select({ id: campusLocation.id })
			.from(campusLocation)
			.limit(1);
		if (existing.length > 0) {
			ctx.counters[this.name] = 0;
			return;
		}

		const total = ctx.config.totalLocations;

		// 1. Locais predefinidos (até o limite)
		const predefinedCount = Math.min(total, PREDEFINED_LOCATIONS.length);
		const predefined = PREDEFINED_LOCATIONS.slice(0, predefinedCount);

		const predefinedRows = predefined.map((loc) => ({
			id: uuidv7(),
			name: loc.name,
			abbreviation: loc.abbreviation,
			description: loc.description,
			latitude: loc.latitude,
			longitude: loc.longitude,
			isActive: true,
		}));

		// 2. Locais gerados (se necessário para completar o total)
		const remaining = total - predefinedCount;
		const generatedRows = generateRandomLocations(remaining);

		const allRows = [...predefinedRows, ...generatedRows];

		if (allRows.length === 0) {
			return;
		}

		await db.insert(campusLocation).values(allRows);

		ctx.counters[this.name] = allRows.length;
	},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateRandomLocations(count: number): Array<{
	id: string;
	name: string;
	abbreviation: string;
	description: string;
	latitude: number;
	longitude: number;
	isActive: boolean;
}> {
	const result: Array<{
		id: string;
		name: string;
		abbreviation: string;
		description: string;
		latitude: number;
		longitude: number;
		isActive: boolean;
	}> = [];

	for (let i = 0; i < count; i++) {
		const category = faker.helpers.arrayElement(LOCATION_CATEGORIES);
		const subject = faker.helpers.arrayElement(LOCATION_SUBJECTS);
		const subjectLowered = subject.toLowerCase();

		const name = category.suffix
			? `${category.prefix} ${subjectLowered} ${category.suffix}`
			: `${category.prefix} ${subjectLowered}`;

		const abbreviation = generateAbbreviation(subject);

		const description = faker.helpers.arrayElement([
			`Bloco dedicado ao curso de ${subjectLowered}`,
			`Laboratórios e salas do curso de ${subjectLowered}`,
			`Prédio anexo do ${subjectLowered}`,
			`Andar térreo — salas de ${subjectLowered}`,
		]);

		result.push({
			id: uuidv7(),
			name,
			abbreviation,
			description,
			latitude: randomLatitude(),
			longitude: randomLongitude(),
			isActive: true,
		});
	}

	return result;
}

function generateAbbreviation(subject: string): string {
	// Pega as primeiras letras de cada palavra, até 5 caracteres
	const words = subject.split(/\s+/);
	const abbr = words
		.map((w) => w.charAt(0).toUpperCase())
		.join("")
		.slice(0, 5);

	return abbr;
}

/**
 * Gera latitude aleatória próxima ao Campus A.C. Simões (Maceió).
 * Range: -9.555 a -9.562
 */
function randomLatitude(): number {
	return faker.number.float({ min: -9.562, max: -9.555, fractionDigits: 6 });
}

/**
 * Gera longitude aleatória próxima ao Campus A.C. Simões (Maceió).
 * Range: -35.770 a -35.780
 */
function randomLongitude(): number {
	return faker.number.float({ min: -35.78, max: -35.77, fractionDigits: 6 });
}
