import type { AppError } from "@mobiliza/domain";

import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";

function toTRPCCode(error: AppError): TRPC_ERROR_CODE_KEY {
	switch (error.code) {
		case "NOT_FOUND":
			return "NOT_FOUND";
		case "UNAUTHORIZED":
			return "UNAUTHORIZED";
		case "FORBIDDEN":
			return "FORBIDDEN";
		case "BAD_REQUEST":
		case "VALIDATION_ERROR":
			return "BAD_REQUEST";
		case "CONFLICT":
			return "CONFLICT";
		default:
			return "INTERNAL_SERVER_ERROR";
	}
}

export { toTRPCCode };
