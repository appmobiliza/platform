/**
 * Entrypoint do servidor HTTP do Mobiliza.
 *
 * Hono gerencia as rotas HTTP. O tRPC é montado em `/trpc` via
 * adaptador oficial. O Better Auth é montado em `/api/auth` como
 * handler puro — ele gerencia login, logout, OAuth callback e sessão.
 *
 * Estrutura de rotas:
 *   GET  /health            → health check (sem auth)
 *   ALL  /api/auth/*        → Better Auth (login, logout, OAuth...)
 *   ALL  /trpc/*            → tRPC router
 */

import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { auth } from "@mobiliza/db/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { openApiDocument, openApiHandler } from "./openapi";
import { appRouter } from "./router";
import { createTRPCContext } from "./trpc/context";

console.log("🚀 Iniciando Mobiliza API...");

const app = new Hono();

// ─── Middlewares globais ──────────────────────────────────────────────────────

app.use(logger());

app.use(
  "*",
  cors({
    origin: process.env.TRUSTED_ORIGINS?.split(",") ?? ["http://localhost:3000"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    provider: process.env.REALTIME_PROVIDER ?? "supabase",
  }),
);

// ─── OpenAPI ─────────────────────────────────────────────────────────────────

app.get("/openapi", (c) => c.redirect("/openapi.json"));

app.get("/openapi.json", (c) => c.json(openApiDocument));

app.all("/openapi/*", async (c) => openApiHandler(c));

// ─── Better Auth ──────────────────────────────────────────────────────────────

/**
 * O Better Auth gerencia todas as rotas sob `/api/auth`.
 * Isso inclui:
 *   POST /api/auth/sign-in/social      → inicia OAuth
 *   GET  /api/auth/callback/google     → callback OAuth
 *   POST /api/auth/sign-out            → logout
 *   GET  /api/auth/session             → retorna sessão atual
 *
 * O cliente chama essas rotas usando o `createAuthClient` do Better Auth,
 * que abstraiu o transporte — não precisamos expô-las via tRPC.
 */
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// ─── tRPC ─────────────────────────────────────────────────────────────────────

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => createTRPCContext(c),

    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`[tRPC error] ${path ?? "unknown"}:`, error);
          }
        : undefined,
  }),
);

// ─── Servidor ─────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3001);

serve({
  fetch: app.fetch,
  port,
});

console.log(`🚀 Mobiliza API rodando em http://localhost:${port}`);
console.log(`   Realtime provider: ${process.env.REALTIME_PROVIDER ?? "supabase"}`);

export default {
  port,
  fetch: app.fetch,
};
