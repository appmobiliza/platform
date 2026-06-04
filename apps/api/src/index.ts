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
import "dotenv/config";

import { auth } from "@mobiliza/auth";
import { db } from "@mobiliza/db/client";
import { notifyUnansweredRequests } from "@mobiliza/domain";
import { apiEnv } from "@mobiliza/env/api";
import { realtimeEnv } from "@mobiliza/env/realtime";
import { createTRPCContext, getRealtimeAdapter } from "@mobiliza/trpc";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { openApiDocument, openApiHandler } from "./openapi";
import { appRouter } from "./router";

console.log("🚀 Iniciando Mobiliza API...");

const app = new Hono();

// ─── Cron Jobs (REST) ─────────────────────────────────────────────────────────

/**
 * Endpoint de manutenção/cron.
 * Deve ser chamado periodicamente por um serviço externo (Vercel Cron, GitHub Actions, etc.)
 */
app.get("/api/cron/check-timeouts", async (c) => {
	// Verificação simples de segredo para evitar chamadas maliciosas
	const cronSecret = apiEnv.CRON_SECRET;
	const authHeader = c.req.header("Authorization");

	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const result = await notifyUnansweredRequests(db, await getRealtimeAdapter());
	return c.json({
		success: true,
		...result,
		timestamp: new Date().toISOString(),
	});
});

// ─── Middlewares globais ──────────────────────────────────────────────────────

app.use(logger());

app.use(
	"*",
	cors({
		origin: apiEnv.TRUSTED_ORIGINS,
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
		provider: realtimeEnv.REALTIME_PROVIDER,
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
			apiEnv.NODE_ENV === "development"
				? ({ path, error }) => {
					console.error(
						`[tRPC error] ${path ?? "unknown"}:`,
						error,
					);
				}
				: undefined,
	}),
);

// ─── Servidor ─────────────────────────────────────────────────────────────────

const port = apiEnv.PORT;

serve({
	fetch: app.fetch,
	port,
});

console.log(`🚀 Mobiliza API rodando em http://localhost:${port}`);
console.log(`   Realtime provider: ${realtimeEnv.REALTIME_PROVIDER}`);

export default {
	port,
	fetch: app.fetch,
};
