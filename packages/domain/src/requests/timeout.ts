import type { Database } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import type { RealtimeAdapter } from "@mobiliza/realtime";
import { and, eq, lt } from "drizzle-orm";

export async function notifyUnansweredRequests(
	db: Database,
	realtime: RealtimeAdapter,
) {
	// Tempo limite = 10 minutos atrás
	const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

	const unansweredRequests = await db.query.serviceRequest.findMany({
		where: and(
			eq(schema.serviceRequest.status, "pending"),
			lt(schema.serviceRequest.createdAt, tenMinutesAgo),
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
