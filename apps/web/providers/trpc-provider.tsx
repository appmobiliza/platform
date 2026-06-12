"use client";

import type { AppRouter } from "@mobiliza/api/router";
import { apiBaseUrl } from "@mobiliza/env/base-url";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";

export const trpc = createTRPCReact<AppRouter>();

let browserQueryClient: QueryClient | undefined;

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
			},
		},
	});
}

function getQueryClient() {
	if (typeof window === "undefined") {
		return createQueryClient();
	}

	browserQueryClient ??= createQueryClient();
	return browserQueryClient;
}

export function TRPCProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const queryClient = getQueryClient();
	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: `${apiBaseUrl}/trpc`,
					fetch(url, options) {
						return fetch(url, {
							...options,
							credentials: "include",
						});
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
