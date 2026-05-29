import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export function handleServerTRPCError(error: unknown): never {
	const trpcCode =
		(error as { data?: { code?: string } }).data?.code ??
		(error as { shape?: { data?: { code?: string } } }).shape?.data?.code;

	if (trpcCode === "UNAUTHORIZED") {
		redirect("/auth");
	}

	throw error;
}
