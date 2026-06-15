/**
 * tRPC Client Configuration for React Native
 *
 * Este arquivo exporta:
 * - `trpc`        → hooks tipados do tRPC (React). Use em componentes com `useQuery`/`useMutation`.
 * - `trpcClient`  → cliente raw do tRPC (non-React). Use em services, callbacks e fora do contexto React.
 *
 * Ambos inferem os tipos do backend (@mobiliza/api) sem precisar importar código,
 * garantindo type-safety de ponta a ponta.
 */

import type {
	AppRouter,
	RouterInputs,
	RouterOutputs,
} from "@mobiliza/trpc-types";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { Platform } from "react-native";

import { getAuthCookie } from "@/lib/auth/client";

// ─── Client URL ────────────────────────────────────────────────────────────────

const getBaseUrl = () => {
	if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

	if (Platform.OS === "android") {
		return "https://unmaidenlike-unaborted-jaelyn.ngrok-free.dev";
	}
	return "http://localhost:3001";
};

// ─── React hooks (via @trpc/react-query) ───────────────────────────────────────

export const trpc = createTRPCReact<AppRouter>();

// ─── Raw client for non-React usage ────────────────────────────────────────────

function createHeaders(): Record<string, string> {
	if (Platform.OS === "web") return {};

	const cookies = getAuthCookie();
	const headers: Record<string, string> = {};
	if (cookies) {
		headers["Cookie"] = cookies;
	}
	return headers;
}

export const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: `${getBaseUrl()}/trpc`,
			fetch:
				Platform.OS === "web"
					? (url, options) =>
						fetch(url, {
							...options,
							credentials: "include",
						})
					: undefined,
			headers: () => createHeaders(),
		}),
	],
});

export type { RouterInputs, RouterOutputs };
