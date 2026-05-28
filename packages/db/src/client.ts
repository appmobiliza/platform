import 'dotenv/config'

import { serverEnv } from "@mobiliza/env";
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
const sql = neon(serverEnv.DATABASE_URL);

export const db = drizzle(sql, {
	schema,
	logger: serverEnv.NODE_ENV === "development",
});

export type Database = typeof db;