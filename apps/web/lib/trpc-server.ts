import { cookies } from "next/headers";

import type { AppRouter } from "@mobiliza/api/src/router";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import { getBackendBaseUrl } from "@/lib/api";

export async function createServerTRPCClient() {
	const cookieStore = await cookies();
	const cookieHeader = cookieStore.toString();

	return createTRPCProxyClient<AppRouter>({
		links: [
			httpBatchLink({
				url: `${getBackendBaseUrl()}/trpc`,
				headers() {
					return cookieHeader ? { cookie: cookieHeader } : {};
				},
			}),
		],
	});
}