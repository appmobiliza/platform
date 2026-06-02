import type { ExportReportSchema } from "@mobiliza/contracts";
import type { Database } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import type { z } from "zod";

export async function generateAttendanceReportCSV(
	input: z.infer<typeof ExportReportSchema>,
	db: Database,
): Promise<string> {
	// Configuração das condições de filtro
	const conditions = [eq(schema.serviceRequest.status, "completed")];

	if (input.from) {
		conditions.push(
			gte(schema.serviceRequest.createdAt, new Date(input.from)),
		);
	}

	if (input.to) {
		conditions.push(
			lte(schema.serviceRequest.createdAt, new Date(input.to)),
		);
	}

	// Realiza a query
	const records = await db.query.serviceAttendance.findMany({
		where: and(
			// We will filter using the request join manually or through a subquery
			// To simplify, we get all attendances and filter those with completed requests
			sql`${schema.serviceAttendance.requestId} IN (
        SELECT id FROM service_request WHERE status = 'completed'
      )`,
		),
		with: {
			request: {
				with: {
					originLocation: true,
					destinationLocation: true,
					studentProfile: { with: { user: true } },
				},
			},
			scholarProfile: { with: { user: true } },
		},
		orderBy: [asc(schema.serviceAttendance.completedAt)],
	});

	// Filtro extra no JS caso precisemos filtrar por campus, ou fazer tudo no SQL (para simplificar, no JS aqui ou no SQL)
	let filteredRecords = records.filter(
		(r) => r.request && r.request.status === "completed",
	);

	if (input.from) {
		filteredRecords = filteredRecords.filter(
			(r) => r.request.createdAt >= new Date(input.from!),
		);
	}
	if (input.to) {
		filteredRecords = filteredRecords.filter(
			(r) => r.request.createdAt <= new Date(input.to!),
		);
	}

	// Header do CSV
	const headers = [
		"ID Atendimento",
		"Data da Solicitação",
		"Data de Conclusão",
		"Tempo de Espera (segundos)",
		"Duração do Deslocamento (segundos)",
		"Estudante",
		"Bolsista",
		"Origem",
		"Destino",
		"Avaliação",
	];

	const rows = filteredRecords.map((att) => {
		const waitTime = att.startedAt
			? Math.floor(
					(att.startedAt.getTime() -
						att.request.createdAt.getTime()) /
						1000,
				)
			: "";

		return [
			att.id,
			att.request.createdAt.toISOString(),
			att.completedAt ? att.completedAt.toISOString() : "",
			waitTime,
			att.durationSeconds || "",
			`"${att.request.studentProfile.user.name}"`,
			`"${att.scholarProfile.user.name}"`,
			`"${att.request.originLocation.name}"`,
			`"${att.request.destinationLocation.name}"`,
			att.rating || "",
		].join(",");
	});

	return [headers.join(","), ...rows].join("\n");
}
