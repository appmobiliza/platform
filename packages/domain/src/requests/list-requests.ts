import type { RequestRecord } from "@mobiliza/contracts";
import type { RequestRepository } from "../ports.js";

export async function listRequests(requestRepository: RequestRepository): Promise<RequestRecord[]> {
  return requestRepository.list();
}