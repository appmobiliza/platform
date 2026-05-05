import type { IncomingMessage, ServerResponse } from "node:http";

export interface ApiRoute {
  method: "GET" | "POST";
  path: string;
  handler(request: IncomingMessage, response: ServerResponse): Promise<void> | void;
}