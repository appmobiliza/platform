import { createServer } from "node:http";
import { closeDatabase, getDatabaseClient } from "@mobiliza/db";
import { createInMemoryRealtime } from "@mobiliza/realtime";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { createRoutes } from "./routes/index.js";
import { createContextFactory } from "./trpc/context.js";
import { appRouter } from "./trpc/router.js";

export function startApiServer(port = Number(process.env.PORT ?? "3001")) {
  const database = getDatabaseClient();
  const realtime = createInMemoryRealtime();
  const routes = createRoutes(database.requests);
  const trpcHandler = createHTTPHandler({
    router: appRouter,
    createContext: createContextFactory(database.requests, realtime),
  });

  const server = createServer(async (request, response) => {
    const method = request.method ?? "GET";
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

    if (url.pathname.startsWith("/trpc")) {
      trpcHandler(request, response);
      return;
    }

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

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, closing database connection...");
    await closeDatabase();
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });

  return server;
}