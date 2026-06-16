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

// ─── Middlewares globais ──────────────────────────────────────────────────────

app.use(logger());

app.use(
	"*",
	cors({
		origin: apiEnv.TRUSTED_ORIGINS,
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["GET", "POST", "OPTIONS", "PUT", "DELETE", "PATCH"],
		credentials: true,
	}),
);

// ─── Realtime — Credenciais para o cliente ─────────────────────────────────────

/**
 * Endpoint genérico que retorna as credenciais necessárias para o
 * client-side (app mobile, frontend web) conectar-se ao mesmo provedor
 * de realtime configurado no servidor.
 *
 * O cliente nunca precisa saber qual provedor está sendo usado —
 * ele recebe `{ provider, config }` e o `@mobiliza/realtime` resolve
 * internamente.
 */
app.get("/api/realtime/credentials", async (c) => {
	try {
		const realtime = await getRealtimeAdapter();
		const credentials = await realtime.getClientCredentials();
		return c.json(credentials);
	} catch (error) {
		console.error("[realtime] Erro ao obter credenciais:", error);
		return c.json({ error: "Erro ao obter credenciais de realtime" }, 500);
	}
});

// ─── Realtime — Token renewal ─────────────────────────────────────────────────

/**
 * Endpoint usado pelo Ably SDK no cliente para renovar o token
 * automaticamente antes da expiração.
 *
 * O cliente configura `authUrl` apontando para esta rota. Quando o
 * token atual está próximo de expirar, o Ably SDK faz uma requisição
 * GET para cá e recebe um token fresco.
 *
 * @see https://ably.com/docs/auth/token
 */
app.get("/api/realtime/token", async (c) => {
	try {
		const realtime = await getRealtimeAdapter();
		const credentials = await realtime.getClientCredentials();
		// Ably SDK aceita tanto um objeto TokenDetails ({ token: "..." })
		// quanto uma string simples com o token
		return c.json({ token: credentials.config.clientToken });
	} catch (error) {
		console.error("[realtime] Erro ao renovar token:", error);
		return c.json({ error: "Erro ao renovar token de realtime" }, 500);
	}
});

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

/**
 * Registra o tRPC nas duas variantes de rota:
 * - `/trpc/*` → chamadas individuais a procedures (ex.: /trpc/profiles.me)
 * - `/trpc`   → requisições batch (httpBatchLink), que POSTAM para /trpc
 *                sem subpath adicional, com os paths das procedures no body
 */
const trpcHandler = trpcServer({
	router: appRouter,
	createContext: (_opts, c) => createTRPCContext(c, getSession),

	onError:
		apiEnv.NODE_ENV === "development"
			? ({ path, error }) => {
				// Ignora probes no endpoint raiz (sem path)
				if (!path && error.code === "NOT_FOUND") return;
				console.error(
					`[tRPC error] ${path ?? "unknown"}:`,
					error,
				);
			}
			: undefined,
});

app.use("/trpc", async (c, next) => {
	console.log("Agent:", c.req.header("User-Agent"), "IP:", c.req.header("User-Agent"));
	return trpcHandler(c, next);
});
app.use("/trpc/*", trpcHandler);

export default app;
