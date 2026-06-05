import { defineConfig } from "tsup";

export default defineConfig({
	entry: { bundle: 'src/index.ts' },
	format: ['esm'],
	outDir: 'dist',
	outExtension: () => ({ js: '.js' }),
	bundle: true,
	splitting: false,
	noExternal: [/^@mobiliza\//],
	external: ['dotenv'],
	target: 'node20',
})
