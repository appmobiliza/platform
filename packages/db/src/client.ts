import type { RequestRepository } from "@mobiliza/domain";
import { createRequestRepository } from "./repositories.js";

export interface DatabaseClient {
  requests: RequestRepository;
}

export function createInMemoryDatabase(): DatabaseClient {
  return {
    requests: createRequestRepository(),
  };
}