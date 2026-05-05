import type { IncomingMessage, ServerResponse } from "node:http";
import type { CreateRequestInput } from "@mobiliza/contracts";
import { createRequest, listRequests, type RequestRepository } from "@mobiliza/domain";
import type { ApiRoute } from "./types.js";

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");

  if (!rawBody) {
    return {};
  }

  return JSON.parse(rawBody) as Record<string, unknown>;
}

function toCreateRequestInput(body: Record<string, unknown>): CreateRequestInput {
  const studentId = typeof body.studentId === "string" ? body.studentId : "";
  const origin = typeof body.origin === "string" ? body.origin : "";
  const destination = typeof body.destination === "string" ? body.destination : "";
  const notes = typeof body.notes === "string" ? body.notes : undefined;
  const requestedAt = typeof body.requestedAt === "string" ? body.requestedAt : undefined;

  if (!studentId || !origin || !destination) {
    throw new Error("Invalid request payload");
  }

  return {
    studentId,
    origin,
    destination,
    notes,
    requestedAt,
  };
}

function createRequestListRoute(requestRepository: RequestRepository): ApiRoute {
  return {
    method: "GET",
    path: "/v1/requests",
    async handler(_request, response) {
      const requests = await listRequests(requestRepository);
      sendJson(response, 200, { requests });
    },
  };
}

function createRequestCreationRoute(requestRepository: RequestRepository): ApiRoute {
  return {
    method: "POST",
    path: "/v1/requests",
    async handler(request, response) {
      try {
        const body = await readJsonBody(request);
        const requestInput = toCreateRequestInput(body);
        const requestRecord = await createRequest(requestInput, requestRepository);
        sendJson(response, 201, { request: requestRecord });
      } catch {
        sendJson(response, 400, { error: "Invalid request payload" });
      }
    },
  };
}

export function createRequestRoutes(requestRepository: RequestRepository): ApiRoute[] {
  return [createRequestListRoute(requestRepository), createRequestCreationRoute(requestRepository)];
}