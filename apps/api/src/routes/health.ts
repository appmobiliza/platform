import type { ApiRoute } from "./types.js";

export const healthRoute: ApiRoute = {
  method: "GET",
  path: "/health",
  async handler(_request, response) {
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ status: "ok", service: "mobiliza-api" }));
  },
};