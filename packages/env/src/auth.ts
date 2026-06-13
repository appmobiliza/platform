import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { commaSeparatedOrigins, loadEnv } from "./shared";

loadEnv();

export const authEnv = createEnv({
	server: {
		NODE_ENV: z.string().min(1),
		TRUSTED_ORIGINS: commaSeparatedOrigins,
		NEXT_PUBLIC_WEB_URL: z.string().min(1).default("http://localhost:3000"),
		WEB_URL: z.string().min(1).default("http://localhost:3000"),
		BETTER_AUTH_SECRET: z.string().min(32),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
	},
	runtimeEnv: process.env,
});
