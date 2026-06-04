import "server-only";

import { appRouter } from "@mobiliza/api/router";
import { getSession } from "@mobiliza/auth/server";
import { createTRPCContextFactory } from "@mobiliza/trpc";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

type ServerTRPCCaller = ReturnType<typeof appRouter.createCaller>;

const createTRPCContextFromHeaders = createTRPCContextFactory(getSession);

const getServerTRPCCaller = cache(async () => {
	return appRouter.createCaller(async () =>
		createTRPCContextFromHeaders(await headers()),
	);
});

export async function withServerTRPC<T>(
	operation: (trpc: ServerTRPCCaller) => Promise<T> | T,
): Promise<T> {
	try {
		return await operation(await getServerTRPCCaller());
	} catch (error) {
		handleServerTRPCError(error);
	}
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
