"use client";

import { useState } from "react";

import type { AppRouter } from "@mobiliza/api/src/router";
import { backendBaseUrl } from "@mobiliza/env/base-url";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

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
					url: `${backendBaseUrl}/trpc`,
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
