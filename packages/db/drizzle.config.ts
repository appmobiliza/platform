import { apiEnv } from "@mobiliza/env/api";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/schema/index.ts",
	out: "./src/migrations",
	dbCredentials: { url: apiEnv.DATABASE_URL },
	verbose: true,
	strict: true,
});
