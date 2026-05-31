/**
 * Generator de solicitações de deslocamento e atendimentos.
 *
 * Cria service_request com variados status (pending, accepted, ongoing,
 * completed, cancelled, unattended) e, quando aplicável, um
 * service_attachment vinculado.
 *
 * Distribuição esperada para 50 solicitações:
 * - 14 pending   (28%) — ainda sem resposta
 * -  7 accepted  (14%) — aceitas mas não iniciadas
 * -  9 ongoing   (18%) — em andamento
 * - 11 completed (22%) — concluídas + avaliação
 * -  5 cancelled (10%) — canceladas pelo estudante
 * -  4 unattended (8%) — não atendidas (tempo expirado)
 */

import {
	campusLocation,
	scholarProfile,
	serviceAttendance,
	serviceRequest,
	studentProfile,
} from "@mobiliza/db/schema";
import { uuidv7 } from "uuidv7";

import { db } from "../lib/db";
import { faker } from "../lib/faker";
import { pickTwoDistinct } from "../lib/helpers";
import type { SeedContext, SeedGenerator } from "../lib/types";

// ─── Tipos dos Status ─────────────────────────────────────────────────────────

type RequestStatus = "pending" | "accepted" | "ongoing" | "completed" | "cancelled" | "unattended";

interface StatusDistribution {
	status: RequestStatus;
	percentage: number; // 0-1
	hasAttendance: boolean;
}

const STATUS_DISTRIBUTION: StatusDistribution[] = [
	{ status: "pending", percentage: 0.28, hasAttendance: false },
	{ status: "accepted", percentage: 0.14, hasAttendance: true },
	{ status: "ongoing", percentage: 0.18, hasAttendance: true },
	{ status: "completed", percentage: 0.22, hasAttendance: true },
	{ status: "cancelled", percentage: 0.10, hasAttendance: false },
	{ status: "unattended", percentage: 0.08, hasAttendance: false },
];

// ─── Generator ────────────────────────────────────────────────────────────────

export const requestGenerator: SeedGenerator = {
	name: "requests",
	dependencies: ["locations", "students", "scholars"],

	async generate(ctx: SeedContext): Promise<void> {
		// Pula se já existirem solicitações (idempotência)
		const existing = await db
			.select({ id: serviceRequest.id })
			.from(serviceRequest)
			.limit(1);
		if (existing.length > 0) {
			ctx.counters[this.name] = 0;
			return;
		}

		const total = ctx.config.totalRequests;

		// 1. Buscar dados existentes no banco
		const students = await db
			.select({ id: studentProfile.id })
			.from(studentProfile);

		const scholars = await db
			.select({ id: scholarProfile.id })
			.from(scholarProfile);

		const locations = await db
			.select({ id: campusLocation.id })
			.from(campusLocation);

		if (students.length === 0 || locations.length < 2) {
			return;
		}

		// 2. Alocar quantidades por status
		const allocation = allocateByStatus(total);

		// 3. Gerar e inserir lotes
		let requestCount = 0;
		let attendanceCount = 0;

		for (const { status, count, hasAttendance } of allocation) {
			if (count === 0) continue;

			const studentIds = students.map((s) => s.id);
			const locationIds = locations.map((l) => l.id);
			const scholarIds = scholars.map((s) => s.id);

			const requests = generateRequests(count, status, studentIds, locationIds);
			await db.insert(serviceRequest).values(requests);

			requestCount += requests.length;

			// 4. Criar atendimentos (para status que têm)
			if (hasAttendance && scholars.length > 0) {
				const attendances = generateAttendances(requests, scholarIds);
				if (attendances.length > 0) {
					await db.insert(serviceAttendance).values(attendances);
					attendanceCount += attendances.length;
				}
			}
		}

		ctx.counters[this.name] = requestCount;
		ctx.counters[`${this.name}.attendances`] = attendanceCount;
	},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface AllocationItem {
	status: RequestStatus;
	count: number;
	hasAttendance: boolean;
}

/**
 * Distribui o total de solicitações entre os status de acordo com
 * as porcentagens definidas, garantindo que a soma bata.
 */
function allocateByStatus(total: number): AllocationItem[] {
	const raw = STATUS_DISTRIBUTION.map((s) => ({
		status: s.status,
		count: Math.round(total * s.percentage),
		hasAttendance: s.hasAttendance,
	}));

	// Ajustar para bater o total (diferenças de arredondamento)
	const allocated = raw.reduce((sum, item) => sum + item.count, 0);
	const diff = total - allocated;

	if (diff !== 0) {
		// Ajusta no maior grupo
		const largest = raw.reduce((max, item) =>
			item.count > max.count ? item : max,
		);
		largest.count += diff;
	}

	return raw;
}

// ─── Geração de Requests ──────────────────────────────────────────────────────

interface RequestInsert {
	id: string;
	studentProfileId: string;
	originLocationId: string;
	destinationLocationId: string;
	status: RequestStatus;
	notes: string | null;
	respondedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

function generateRequests(
	count: number,
	status: RequestStatus,
	studentIds: string[],
	locationIds: string[],
): RequestInsert[] {
	const now = new Date();

	return Array.from({ length: count }, () => {
		const studentProfileId = faker.helpers.arrayElement(studentIds);
		const [originId, destinationId] = pickTwoDistinct(locationIds);
		const daysAgo = faker.number.int({ min: 1, max: 30 });
		const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

		let respondedAt: Date | null = null;
		if (status !== "pending") {
			const responseDelay = faker.number.int({ min: 1, max: 120 }); // minutos
			respondedAt = new Date(createdAt.getTime() + responseDelay * 60 * 1000);
		}

		const notes = faker.datatype.boolean(0.3)
			? faker.helpers.arrayElement([
					"Estou na entrada principal do bloco",
					"Chego em 5 minutos no ponto de encontro",
					"Hoje estou com a cadeira de rodas manual",
					"Pode confirmar que está vindo?",
					"Vou precisar de ajuda com a porta",
				])
			: null;

		return {
			id: uuidv7(),
			studentProfileId,
			originLocationId: originId,
			destinationLocationId: destinationId,
			status,
			notes,
			respondedAt,
			createdAt,
			updatedAt: respondedAt ?? createdAt,
		};
	});
}

// ─── Geração de Attendances ───────────────────────────────────────────────────

interface AttendanceInsert {
	id: string;
	requestId: string;
	scholarProfileId: string;
	acceptedAt: Date;
	startedAt: Date | null;
	completedAt: Date | null;
	durationSeconds: number | null;
	rating: number | null;
	ratingComment: string | null;
	createdAt: Date;
	updatedAt: Date;
}

function generateAttendances(
	requests: RequestInsert[],
	scholarIds: string[],
): AttendanceInsert[] {
	const now = new Date();

	return requests.map((req) => {
		const scholarProfileId = faker.helpers.arrayElement(scholarIds);
		const acceptedAt = req.respondedAt ?? new Date(now.getTime() - 60 * 1000);

		let startedAt: Date | null = null;
		let completedAt: Date | null = null;
		let durationSeconds: number | null = null;
		let rating: number | null = null;
		let ratingComment: string | null = null;

		if (req.status === "ongoing" || req.status === "completed") {
			const startDelay = faker.number.int({ min: 2, max: 15 }); // minutos
			startedAt = new Date(acceptedAt.getTime() + startDelay * 60 * 1000);
		}

		if (req.status === "completed") {
			const completionDelay = faker.number.int({ min: 5, max: 60 }); // minutos
			completedAt = new Date(
				(startedAt ?? acceptedAt).getTime() + completionDelay * 60 * 1000,
			);
			durationSeconds = completionDelay * 60;

			// Avaliação (80% dos concluídos têm avaliação)
			if (faker.datatype.boolean(0.8)) {
				rating = faker.number.int({ min: 3, max: 5 });
				ratingComment = rating >= 4
					? faker.helpers.arrayElement([
							"Atendimento excelente, muito atencioso",
							"Ótimo, chegou rápido e foi muito prestativo",
							"Perfeito, me ajudou muito como sempre",
							"Muito bom, obrigado pelo apoio",
						])
					: faker.helpers.arrayElement([
							"Bom, mas demorou um pouco para chegar",
							"Atendimento adequado, poderia ser mais ágil",
							"Foi ok, mas já tive atendimentos melhores",
						]);
			}
		}

		return {
			id: uuidv7(),
			requestId: req.id,
			scholarProfileId,
			acceptedAt,
			startedAt,
			completedAt,
			durationSeconds,
			rating,
			ratingComment,
			createdAt: acceptedAt,
			updatedAt: completedAt ?? acceptedAt,
		};
	});
}


