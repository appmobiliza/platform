import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { loadEnv } from "./loader";
import { commaSeparatedOrigins } from "./shared";

loadEnv();

export const authEnv = createEnv({
	server: {
		NODE_ENV: z.string().min(1),
		TRUSTED_ORIGINS: commaSeparatedOrigins,
		API_URL: z.string().min(1).default("http://localhost:3001"),
		NEXT_PUBLIC_API_URL: z.string().min(1).default("http://localhost:3001"),
		WEB_URL: z.string().min(1).default("http://localhost:3000"),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.string().min(1).default("http://localhost:3001"),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
	},
	runtimeEnv: process.env,
});
