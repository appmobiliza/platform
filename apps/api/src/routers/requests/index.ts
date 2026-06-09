import { router } from "@mobiliza/trpc";

import { managerList } from "./manager/managerList.js";
import { accept } from "./scholar/accept.js";
import { active } from "./scholar/active.js";
import { complete } from "./scholar/complete.js";
import { getAttendanceById } from "./scholar/getAttendanceById.js";
import { pending } from "./scholar/pending.js";
import { reportIssue } from "./scholar/reportIssue.js";
import { scholarHistory } from "./scholar/scholarHistory.js";
import { start } from "./scholar/start.js";
import { cancel } from "./student/cancel.js";
import { create } from "./student/create.js";
import { rate } from "./student/rate.js";
import { studentHistory } from "./student/studentHistory.js";
import { markUnattended } from "./student/unattended.js";

/**
 * Router de solicitações de deslocamento modularizado.
 * Agrega todos os procedimentos da pasta requests/.
 */
export const requestsRouter = router({
	create,
	cancel,
	markUnattended,
	accept,
	reportIssue,
	start,
	complete,
	rate,
	studentHistory,
	scholarHistory,
	pending,
	managerList,
	active,
	getAttendanceById,
});
