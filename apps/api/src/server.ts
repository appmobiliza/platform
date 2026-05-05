import { createServer } from "node:http";
import { createInMemoryDatabase } from "@mobiliza/db";
import { createRoutes } from "./routes/index.js";

export function startApiServer(port = Number(process.env.PORT ?? "3001")) {
  const database = createInMemoryDatabase();
  const routes = createRoutes(database.requests);

  const server = createServer(async (request, response) => {
    const method = request.method ?? "GET";
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const route = routes.find((candidate) => candidate.method === method && candidate.path === url.pathname);

    if (!route) {
      response.statusCode = 404;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ error: "Not Found" }));
      return;
    }

    await route.handler(request, response);
  });

  server.listen(port, () => {
    console.log(`Mobiliza API listening on port ${port}`);
  });

  return server;
}