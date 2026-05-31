import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { optionalString, requireEnv } from "./shared";

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
