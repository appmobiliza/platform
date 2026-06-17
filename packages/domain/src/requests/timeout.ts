import type { Database } from "@mobiliza/db/client";
import * as schema from "@mobiliza/db/schema";
import type { RealtimeAdapter } from "@mobiliza/realtime";

import { and, eq, inArray, lt } from "drizzle-orm";

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

		// Notifica os bolsistas para remover a solicitação da lista de pendentes
		try {
			await realtime.publish(
				"requests:pending",
				"request:unattended",
				{ requestId: request.id },
			);
		} catch (e) {
			console.error(
				"[Timeout] Failed to publish request:unattended to pending channel:",
				e,
			);
		}

		unattendedCount++;
	}

	return { notified: unansweredRequests.length, unattended: unattendedCount };
}

/**
 * Cancela solicitações que ficaram estagnadas nos status "accepted" ou "ongoing"
 * por mais de 2 horas sem conclusão (completedAt do attendance nulo).
 *
 * - "accepted": o bolsista aceitou mas nunca iniciou o deslocamento.
 * - "ongoing": o deslocamento foi iniciado mas nunca concluído.
 *
 * Notifica o estudante e os gestores via realtime.
 */
export async function cancelStaleRequests(
	db: Database,
	realtime: RealtimeAdapter,
) {
	const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
	const now = new Date();

	const staleRequests = await db.query.serviceRequest.findMany({
		where: inArray(schema.serviceRequest.status, ["accepted", "ongoing"]),
		columns: { id: true, status: true, studentProfileId: true },
		with: {
			attendance: {
				columns: { acceptedAt: true, startedAt: true, completedAt: true },
			},
		},
	});

	const toCancel = staleRequests.filter((req) => {
		const att = req.attendance;
		if (!att) return false;
		if (att.completedAt) return false;

		if (req.status === "accepted") {
			return att.acceptedAt < twoHoursAgo;
		}

		if (req.status === "ongoing") {
			return att.startedAt && att.startedAt < twoHoursAgo;
		}

		return false;
	});

	if (toCancel.length === 0) {
		return { cancelled: 0 };
	}

	let cancelledCount = 0;

	for (const request of toCancel) {
		await db
			.update(schema.serviceRequest)
			.set({ status: "cancelled", updatedAt: now })
			.where(eq(schema.serviceRequest.id, request.id));

		// Notifica o estudante via realtime
		try {
			await realtime.publish(
				`request:${request.id}`,
				"request:cancelled",
				{ requestId: request.id },
			);
		} catch (e) {
			console.error(
				"[Timeout] Failed to publish request:cancelled:",
				e,
			);
		}

		// Notifica os gestores
		try {
			await realtime.publish(
				"admin:alerts",
				"timeout:request_stale",
				{
					requestId: request.id,
					studentProfileId: request.studentProfileId,
					previousStatus: request.status,
				},
			);
		} catch (e) {
			console.error(
				"[Timeout] Failed to publish admin alert:",
				e,
			);
		}

		cancelledCount++;
	}

	return { cancelled: cancelledCount };
}
