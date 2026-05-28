import { router } from "../../trpc/context";
import { create } from "./create";
import { cancel } from "./cancel";
import { accept } from "./accept";
import { start } from "./start";
import { complete } from "./complete";
import { rate } from "./rate";
import { myHistory } from "./myHistory";
import { available } from "./available";
import { scholarHistory } from "./scholarHistory";

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
  scholarHistory,
});
