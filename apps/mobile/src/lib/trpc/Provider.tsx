import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { Platform } from "react-native";

import { trpc } from "./client";

// URL do Backend: localhost no iOS, 10.0.2.2 no Android (Emulador)
const getBaseUrl = () => {
	// Em produção, isso virá de uma variável de ambiente (EXPO_PUBLIC_API_URL)
	if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

	if (Platform.OS === "android") {
		return "http://10.0.2.2:3001";
	}
	return "http://localhost:3001";
};

const getWsUrl = () => {
	const baseUrl = getBaseUrl();
	return baseUrl.replace(/^http/, "ws");
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
				splitLink({
					condition(op) {
						return op.type === "subscription";
					},
					true: wsLink({
						client: createWSClient({
							url: `${getWsUrl()}/trpc`,
						}),
					}),
					false: httpBatchLink({
						url: `${getBaseUrl()}/trpc`,
						async headers() {
							// No futuro, você pegará o token JWT/Cookie aqui:
							// const token = await getAuthToken();
							return {
								// authorization: token ? `Bearer ${token}` : undefined,
							};
						},
					}),
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
