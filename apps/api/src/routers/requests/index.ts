import { router } from "@mobiliza/trpc";

import { managerList } from "./manager/managerList";
import { accept } from "./scholar/accept";
import { complete } from "./scholar/complete";
import { pending } from "./scholar/pending";
import { scholarHistory } from "./scholar/scholarHistory";
import { start } from "./scholar/start";
import { cancel } from "./student/cancel";
import { create } from "./student/create";
import { rate } from "./student/rate";
import { studentHistory } from "./student/studentHistory";

/**
 * Router de solicitações de deslocamento modularizado.
 * Agrega todos os procedimentos da pasta requests/.
 */
export const requestsRouter = router({
	create,
	cancel,
	accept,
	start,
	complete,
	rate,
	studentHistory,
	scholarHistory,
	pending,
	managerList,
});
