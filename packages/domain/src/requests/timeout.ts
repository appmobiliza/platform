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

	const now = new Date();

	const unansweredRequests = await db.query.serviceRequest.findMany({
		where: and(
			eq(schema.serviceRequest.status, "pending"),
			lt(schema.serviceRequest.createdAt, threshold),
		),
	});

	if (unansweredRequests.length === 0) {
		return { notified: 0, unattended: 0 };
	}

	// Marca as solicitações como não atendidas e notifica os canais pertinentes
	let unattendedCount = 0;

	for (const request of unansweredRequests) {
		await db
			.update(schema.serviceRequest)
			.set({ status: "unattended", respondedAt: now, updatedAt: now })
			.where(eq(schema.serviceRequest.id, request.id));

		// Notifica o estudante via realtime
		try {
			await realtime.publish(
				`request:${request.id}`,
				"request:unattended",
				{ requestId: request.id },
			);
		} catch (e) {
			console.error(
				"[Timeout] Failed to publish request:unattended:",
				e,
			);
		}

		// Notifica os gestores
		try {
			await realtime.publish(
				"admin:alerts",
				"timeout:request_unanswered",
				{
					requestId: request.id,
					studentProfileId: request.studentProfileId,
					createdAt: request.createdAt,
				},
			);
		} catch (e) {
			console.error(
				"[Timeout] Failed to publish admin alert:",
				e,
			);
		}

		unattendedCount++;
	}

	return { notified: unansweredRequests.length, unattended: unattendedCount };
}
