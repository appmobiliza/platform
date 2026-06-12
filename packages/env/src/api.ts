import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { commaSeparatedOrigins, loadEnv, nodeEnvSchema, optionalString } from "./shared";

loadEnv();

export const apiEnv = createEnv({
	server: {
		NODE_ENV: nodeEnvSchema,
		TRUSTED_ORIGINS: commaSeparatedOrigins,
		DATABASE_URL: z.string().min(1),
		CRON_SECRET: optionalString,
		PORT: z.coerce.number().int().positive().default(3001),
	},
	runtimeEnv: process.env,
});
