/**
 * Entry point para a Vercel Serverless Function.
 *
 * No deploy, o `buildCommand` (definido em vercel.json) executa
 * `tsup --config tsup.vercel.ts` antes do @vercel/node compilar
 * este arquivo. O tsup produz dist/bundle.js com todos os pacotes
 * do monorepo (@mobiliza/*) compilados e inline. Este entrypoint
 * apenas re-exporta o app montado a partir desse bundle.
 *
 * A Vercel descobre este arquivo pela convenção de pasta `api/`.
 * O `handle` do hono/vercel adapta o `app.fetch` para o formato
 * de handler esperado pelas Serverless Functions da Vercel.
 *
 * Todas as requisições são reescritas para cá via vercel.json:
 *   { "source": "/(.*)", "destination": "/api/index" }
 */

import { handle } from "hono/vercel";

import app from "../dist/index.js";

export const runtime = "nodejs";

export default handle(app);
