import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { commaSeparatedOrigins, loadEnv, nodeEnvSchema, optionalString } from "./shared";

loadEnv();

export const apiEnv = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		PORT: z.coerce.number().int().positive().default(3001),
		NODE_ENV: nodeEnvSchema,
		TRUSTED_ORIGINS: commaSeparatedOrigins,
		CRON_SECRET: optionalString,
	},
	runtimeEnv: process.env,
});
