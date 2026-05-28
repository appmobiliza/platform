import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const commaSeparatedOrigins = z
	.string()
	.default("http://localhost:3000,http://localhost:3001")
	.transform((value: string) =>
		value
			.split(",")
			.map((origin: string) => origin.trim())
			.filter(Boolean),
	);

const optionalString = z.string().min(1).optional();

const nodeEnvSchema = z
	.enum(["development", "test", "production"])
	.default("development");

export const serverEnv = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		PORT: z.coerce.number().int().positive().default(3001),
		NODE_ENV: nodeEnvSchema,
		TRUSTED_ORIGINS: commaSeparatedOrigins,
		CRON_SECRET: optionalString,
	},
	runtimeEnv: process.env,
});

export const realtimeEnv = createEnv({
	server: {
		REALTIME_PROVIDER: z
			.enum(["mock", "supabase", "websocket", "ably", "pusher"])
			.default("supabase"),
		SUPABASE_URL: optionalString,
		SUPABASE_ANON_KEY: optionalString,
		WS_URL: optionalString,
		ABLY_API_KEY: optionalString,
		PUSHER_APP_ID: optionalString,
		PUSHER_KEY: optionalString,
		PUSHER_SECRET: optionalString,
		PUSHER_CLUSTER: optionalString,
	},
	runtimeEnv: process.env,
});

export function requireEnv(value: string | undefined, name: string): string {
	if (!value) {
		throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
	}

	return value;
}

export function requireSupabaseEnv() {
	return {
		url: requireEnv(realtimeEnv.SUPABASE_URL, "SUPABASE_URL"),
		anonKey: requireEnv(realtimeEnv.SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY"),
	};
}

export function requireWebSocketEnv() {
	return {
		url: requireEnv(realtimeEnv.WS_URL, "WS_URL"),
	};
}

export function requireAblyEnv() {
	return {
		apiKey: requireEnv(realtimeEnv.ABLY_API_KEY, "ABLY_API_KEY"),
	};
}

export function requirePusherEnv() {
	return {
		appId: requireEnv(realtimeEnv.PUSHER_APP_ID, "PUSHER_APP_ID"),
		key: requireEnv(realtimeEnv.PUSHER_KEY, "PUSHER_KEY"),
		secret: requireEnv(realtimeEnv.PUSHER_SECRET, "PUSHER_SECRET"),
		cluster: requireEnv(realtimeEnv.PUSHER_CLUSTER, "PUSHER_CLUSTER"),
	};
}