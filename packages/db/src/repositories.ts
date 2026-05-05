import type { RequestRecord } from "@mobiliza/contracts";
import type { RequestRepository } from "@mobiliza/domain";

export function createRequestRepository(initialRequests: RequestRecord[] = []): RequestRepository {
  const requests = [...initialRequests];

  return {
    async list() {
      return [...requests];
    },
    async create(request) {
      requests.push(request);
      return request;
    },
  };
}