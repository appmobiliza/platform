import { AppError } from "@mobiliza/domain";

import { TRPCError } from "@trpc/server";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

import { middleware } from "./context";

function appErrorToTRPCCode(error: AppError): TRPC_ERROR_CODE_KEY {
	const map: Record<string, TRPC_ERROR_CODE_KEY> = {
		NOT_FOUND: "NOT_FOUND",
		UNAUTHORIZED: "UNAUTHORIZED",
		FORBIDDEN: "FORBIDDEN",
		BAD_REQUEST: "BAD_REQUEST",
		VALIDATION_ERROR: "BAD_REQUEST",
		CONFLICT: "CONFLICT",
	};
	return map[error.code] ?? "INTERNAL_SERVER_ERROR";
}

/**
 * Middleware que converte AppError → TRPCError automaticamente.
 * Use em todas as procedures base para nunca precisar de try/catch
 * nos routers.
 */
export const errorHandler = middleware(async ({ next }) => {
	const result = await next();
	if (!result.ok && result.error.cause instanceof AppError) {
		throw new TRPCError({
			code: appErrorToTRPCCode(result.error.cause),
			message: result.error.cause?.message,
			cause: result.error.cause,
		});
	}
	return result;
});
