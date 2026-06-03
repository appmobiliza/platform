import type { Context } from "hono";
import {
	createOpenApiFetchHandler,
	generateOpenApiDocument,
} from "trpc-to-openapi";

import { appRouter } from "./router";
import { createTRPCContext } from "./trpc/context";

const port = Number(process.env.PORT ?? 3001);
const baseUrl =
	process.env.OPENAPI_BASE_URL ?? `http://localhost:${port}/openapi`;

export const openApiDocument = generateOpenApiDocument(appRouter, {
	title: "Mobiliza API",
	version: "0.1.0",
	baseUrl,
});

export async function openApiHandler(c: Context) {
	return createOpenApiFetchHandler({
		endpoint: "/openapi",
		router: appRouter,
		createContext: async () => createTRPCContext(c),
		req: c.req.raw,
	});
}
