import type { RequestRepository } from "@mobiliza/domain";
import { healthRoute } from "./health.js";
import { createRequestRoutes } from "./requests.js";
import type { ApiRoute } from "./types.js";

export function createRoutes(requestRepository: RequestRepository): ApiRoute[] {
  return [healthRoute, ...createRequestRoutes(requestRepository)];
}