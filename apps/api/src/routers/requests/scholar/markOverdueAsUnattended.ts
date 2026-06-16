import { db } from "@mobiliza/db/client";
import { notifyUnansweredRequests } from "@mobiliza/domain";
import { getRealtimeAdapter, scholarProcedure } from "@mobiliza/trpc";

/**
 * Marca como "unattended" todas as solicitações pendentes cujo
 * tempo de espera ultrapassou o limite configurado
 * (`maxServiceRequestTime`).
 *
 * Esta mutation serve como substituto para a cron job de timeout
 * quando um bolsista faz login — garantindo que solicitações
 * antigas sejam limpas da lista de pendentes mesmo sem um CRON
 * ativo.
 */
export const markOverdueAsUnattended = scholarProcedure.mutation(async () => {
	const realtime = await getRealtimeAdapter();
	const result = await notifyUnansweredRequests(db, realtime);

	return {
		markedAsUnattended: result.unattended,
		totalNotified: result.notified,
	};
});
