import { cookies } from "next/headers";

import type { AppRouter } from "@mobiliza/api/src/router";
import { backendBaseUrl } from "@mobiliza/env/base-url";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

export async function createServerTRPCClient() {
	const cookieStore = await cookies();
	const cookieHeader = cookieStore.toString();

	return createTRPCProxyClient<AppRouter>({
		links: [
			httpBatchLink({
				url: `${backendBaseUrl}/trpc`,
				headers() {
					return cookieHeader ? { cookie: cookieHeader } : {};
				},
			}),
		],
	});
}