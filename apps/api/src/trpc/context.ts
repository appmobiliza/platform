import type { IncomingMessage, ServerResponse } from "node:http";
import type { RequestRepository } from "@mobiliza/domain";
import type { RealtimeClient } from "@mobiliza/realtime";

export interface ApiContext {
  requests: RequestRepository;
  realtime: RealtimeClient;
  request: IncomingMessage;
  response: ServerResponse;
}

export function createContextFactory(requests: RequestRepository, realtime: RealtimeClient) {
  return ({ req, res }: { req: IncomingMessage; res: ServerResponse }): ApiContext => ({
    requests,
    realtime,
    request: req,
    response: res,
  });
}
