import { router } from "../../trpc/context";
import { accept } from "./accept";
import { available } from "./available";
import { cancel } from "./cancel";
import { complete } from "./complete";
import { create } from "./create";
import { myHistory } from "./myHistory";
import { rate } from "./rate";
import { start } from "./start";

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
	myHistory,
	available,
});
