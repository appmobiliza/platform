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
 *   GET  /api/cron/*        → cron jobs (disparados pela Vercel)
 */

import { auth } from "@mobiliza/auth";
import { getSession } from "@mobiliza/auth/server";
import { db } from "@mobiliza/db/client";
import { notifyUnansweredRequests } from "@mobiliza/domain";
import { apiEnv } from "@mobiliza/env/api";
import { realtimeEnv } from "@mobiliza/env/realtime";
import { createTRPCContext, getRealtimeAdapter } from "@mobiliza/trpc";

import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { appRouter } from "./router.js";

const app = new Hono();

// ─── Cron Jobs ────────────────────────────────────────────────────────────────

/**
 * Endpoint de manutenção/cron.
 */
app.get("/api/cron/check-timeouts", async (c) => {
	const cronSecret = apiEnv.CRON_SECRET;
	const authHeader = c.req.header("Authorization");

	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const result = await notifyUnansweredRequests(
		db,
		await getRealtimeAdapter(),
	);
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

// ─── Better Auth ──────────────────────────────────────────────────────────────

/**
 * O Better Auth gerencia todas as rotas sob `/api/auth`.
 * Isso inclui:
 *   POST /api/auth/sign-in/social      → inicia OAuth
 *   GET  /api/auth/callback/google     → callback OAuth
 *   POST /api/auth/sign-out            → logout
 *   GET  /api/auth/session             → retorna sessão atual
 */
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// ─── tRPC ─────────────────────────────────────────────────────────────────────

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, c) => createTRPCContext(c, getSession),

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

export default app;
