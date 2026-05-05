import type { RequestRecord } from "@mobiliza/contracts";

export interface RequestRepository {
  list(): Promise<RequestRecord[]>;
  create(request: RequestRecord): Promise<RequestRecord>;
}