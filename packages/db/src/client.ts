import { apiEnv } from "@mobiliza/env/api";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * Cliente HTTP do Neon — compatível com ambientes serverless (Vercel, Cloudflare
 * Workers) e com servidores Node.js tradicionais.
 *
 * O driver HTTP não suporta transações. Operações que precisam de atomicidade
 * usam updates condicionais (ex: `UPDATE ... WHERE status = 'pending'`) no lugar
 * de transações.
 */
const sql = neon(apiEnv.DATABASE_URL);

export const db = drizzle(sql, {
	schema,
	logger: apiEnv.NODE_ENV === "development",
});

export type Database = typeof db;
