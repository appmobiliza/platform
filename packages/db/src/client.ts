import { apiEnv } from "@mobiliza/env/api";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * Cliente HTTP do Neon — compatível com ambientes serverless (Vercel, Cloudflare
 * Workers) e com servidores Node.js tradicionais.
 *
 * Para ambientes com conexões persistentes (servidor dedicado no Railway ou
 * Fly.io), considere trocar para `drizzle-orm/neon-serverless` com WebSocket
 * pool, que oferece melhor performance em alta concorrência.
 */
const sql = neon(apiEnv.DATABASE_URL);

export const db = drizzle(sql, {
	schema,
	logger: apiEnv.NODE_ENV === "development",
});

export type Database = typeof db;
