import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { Platform } from "react-native";

import { authClient } from "@/lib/auth-client";

import { trpc } from "./client";

// URL do Backend: localhost no iOS, 10.0.2.2 no Android (Emulador)
const getBaseUrl = () => {
	// Em produção, isso virá de uma variável de ambiente (EXPO_PUBLIC_API_URL)
	if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

	if (Platform.OS === "android") {
		return "https://unmaidenlike-unaborted-jaelyn.ngrok-free.dev";
	}
	return "http://localhost:3001";
};

export function TRPCProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Cache configurado para RN (não refetch em background cego)
						refetchOnWindowFocus: false,
						retry: false,
					},
				},
			}),
	);

	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: `${getBaseUrl()}/trpc`,
					// On web, the browser forbids manually setting the Cookie header.
					// Use credentials: "include" so cookies are sent automatically.
					// On native, fetch has no such restriction, so we manually attach
					// the cookie from the secure store via the headers function below.
					fetch:
						Platform.OS === "web"
							? (url, options) =>
									fetch(url, {
										...options,
										credentials: "include",
									})
							: undefined,
					async headers() {
						// Web: cookies are sent automatically via credentials: "include"
						if (Platform.OS === "web") return {};

						const cookies = authClient.getCookie();
						const headers: Record<string, string> = {};
						if (cookies) {
							headers["Cookie"] = cookies;
						}
						return headers;
					},
				}),
			],
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</trpc.Provider>
	);
}
