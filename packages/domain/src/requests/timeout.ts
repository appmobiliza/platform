import type { Database } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import type { RealtimeAdapter } from "@mobiliza/realtime";

import { and, eq, lt } from "drizzle-orm";

/**
 * Tempo limite padrão (fallback) em minutos para solicitações sem resposta.
 * Usado quando não há configuração no banco.
 */
const DEFAULT_TIMEOUT_MINUTES = 5;

export async function notifyUnansweredRequests(
	db: Database,
	realtime: RealtimeAdapter,
) {
	// Tenta carregar o tempo limite configurado no banco
	const setting = await db.query.appSettings.findFirst({
		where: eq(schema.appSettings.key, "maxServiceRequestTime"),
	});

	const timeoutMinutes =
		(setting?.value as number | undefined) ?? DEFAULT_TIMEOUT_MINUTES;

	const threshold = new Date(
		Date.now() - timeoutMinutes * 60 * 1000,
	);

	const unansweredRequests = await db.query.serviceRequest.findMany({
		where: and(
			eq(schema.serviceRequest.status, "pending"),
			lt(schema.serviceRequest.createdAt, threshold),
		),
	});

	if (unansweredRequests.length === 0) {
		return { notified: 0 };
	}

	// Notifica o canal dos gestores (admins) para cada solicitação atrasada
	// Poderíamos agrupar em uma só mensagem, mas por simplicidade enviamos eventos individuais
	for (const request of unansweredRequests) {
		await realtime.publish("admin:alerts", "timeout:request_unanswered", {
			requestId: request.id,
			studentProfileId: request.studentProfileId,
			createdAt: request.createdAt,
		});
	}

	return { notified: unansweredRequests.length };
}
