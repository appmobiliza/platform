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
 * A solução: usar `noExternal` para que o tsup compile e inline todos
 * os pacotes do monorepo no bundle de saída. Dependências externas (hono,
 * better-auth, drizzle-orm, zod, etc.) ficam como imports normais — a
 * Vercel as instala e disponibiliza em node_modules no runtime.
 *
 * O bundle de saída substitui `api/index.ts`, então o script de build
 * também limpa o arquivo fonte para evitar que o @vercel/node o recompile
 * por cima do bundle.
 */
export default defineConfig({
	entry: ["api/index.ts"],
	format: "esm",
	target: "node22",
	clean: false,
	dts: false,
	sourcemap: false,
	splitting: false,
	treeshake: true,
	noExternal: [
		"@mobiliza/auth",
		"@mobiliza/contracts",
		"@mobiliza/db",
		"@mobiliza/domain",
		"@mobiliza/env",
		"@mobiliza/realtime",
		"@mobiliza/trpc",
	],
	outDir: "api",
});
