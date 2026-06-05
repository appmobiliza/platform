/**
 * Entry point para a Vercel Serverless Function.
 *
 * A Vercel descobre este arquivo pela convenção de pasta `api/`.
 * O `handle` do hono/vercel adapta o `app.fetch` para o formato
 * de handler esperado pelas Serverless Functions da Vercel.
 *
 * Todas as requisições são reescritas para cá via vercel.json:
 *   { "source": "/(.*)", "destination": "/api/index" }
 */

import { handle } from "hono/vercel";

import app from "../src/index";

export const runtime = "nodejs";

export default handle(app);
