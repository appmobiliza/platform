/**
 * Entry point para desenvolvimento local.
 *
 * Sobe um servidor HTTP persistente via @hono/node-server.
 * Este arquivo NÃO é usado em produção — a Vercel usa `api/index.ts`.
 *
 * Para rodar:
 *   pnpm dev  →  tsx watch src/server.ts
 */

import { apiEnv } from "@mobiliza/env/api";
import { realtimeEnv } from "@mobiliza/env/realtime";

import { serve } from "@hono/node-server";

import app from "./index.js";

const port = apiEnv.PORT;

serve({
	fetch: app.fetch,
	port,
});

console.log(`🚀 Mobiliza API rodando em http://localhost:${port}`);
console.log(`   Realtime provider: ${realtimeEnv.REALTIME_PROVIDER}`);
