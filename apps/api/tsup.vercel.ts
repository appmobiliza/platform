import { defineConfig } from "tsup";

/**
 * Configuração específica para o deploy na Vercel.
 *
 * O problema: todos os pacotes do monorepo (@mobiliza/*) apontam seus
 * `exports` no package.json diretamente para arquivos `.ts`. Isso funciona
 * no desenvolvimento com `tsx`, mas a Vercel compila apenas os arquivos
 * .ts da API, não os pacotes em node_modules. No runtime, o Node.js
 * não consegue carregar arquivos `.ts`, resultando em ERR_MODULE_NOT_FOUND.
 *
 * A solução: compilar os pacotes do monorepo com tsup para um bundle
 * intermediário (`dist/bundle.js`) que o entrypoint da Vercel importa.
 * Dependências externas (hono, better-auth, drizzle-orm, zod, etc.)
 * ficam como imports normais — a Vercel as instala e disponibiliza
 * em node_modules no runtime.
 *
 * Fluxo no deploy:
 *   1. buildCommand → tsup empacota src/index.ts → dist/bundle.js
 *   2. @vercel/node compila api/index.ts → api/index.js
 *   3. api/index.js importa de dist/bundle.js (já compilado)
 *
 * Localmente o entrypoint não é usado (roda com tsx src/server.ts).
 */
export default defineConfig({
	entry: { bundle: 'src/index.ts' },
	format: ['esm'],
	outDir: 'dist',
	outExtension: () => ({ js: '.js' }),
	bundle: true,
	splitting: false,
	noExternal: [/^@mobiliza\//],
	target: 'node20',
})
