import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { loadEnv } from "./loader";
import { optionalString, requireEnvVar } from "./shared";

loadEnv();

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

export function requireSupabaseEnv() {
	return {
		url: requireEnvVar(realtimeEnv, "SUPABASE_URL"),
		anonKey: requireEnvVar(realtimeEnv, "SUPABASE_ANON_KEY"),
	};
}

export function requireWebSocketEnv() {
	return {
		url: requireEnvVar(realtimeEnv, "WS_URL"),
	};
}

export function requireAblyEnv() {
	return {
		apiKey: requireEnvVar(realtimeEnv, "ABLY_API_KEY"),
	};
}

export function requirePusherEnv() {
	return {
		appId: requireEnvVar(realtimeEnv, "PUSHER_APP_ID"),
		key: requireEnvVar(realtimeEnv, "PUSHER_KEY"),
		secret: requireEnvVar(realtimeEnv, "PUSHER_SECRET"),
		cluster: requireEnvVar(realtimeEnv, "PUSHER_CLUSTER"),
	};
}
