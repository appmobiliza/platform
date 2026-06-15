/**
 * API Service Module
 *
 * Utilitários de erro para comunicação com a API do Mobiliza.
 *
 * Prefira usar tRPC (via `trpcClient`) ou Better Auth (via `authClient`)
 * diretamente nos seus componentes e services.
 * Este módulo contém apenas funções auxiliares de parsing de erro.
 */

import type { ApiError } from "../types/api";

// ============================================
// ERROR PARSING
// ============================================

/**
 * Traduz um erro do tRPC (ou erro genérico) para o formato ApiError.
 */
export function parseApiError(error: unknown): ApiError {
	if (!error || typeof error !== "object") {
		return {
			code: "NETWORK_ERROR",
			message: "Erro de conexão",
		};
	}

	const err = error as Record<string, unknown>;

	// tRPC error shape
	if (err.shape && typeof err.shape === "object") {
		const shape = err.shape as Record<string, unknown>;

		switch (shape.code) {
			case "UNAUTHORIZED":
				return {
					code: "UNAUTHORIZED",
					message: (shape.message as string) || "Não autorizado",
				};
			case "FORBIDDEN":
				return {
					code: "UNAUTHORIZED",
					message: (shape.message as string) || "Acesso negado",
				};
			case "NOT_FOUND":
				return {
					code: "SERVER_ERROR",
					message: (shape.message as string) || "Recurso não encontrado",
				};
			case "BAD_REQUEST": {
				const data = shape.data as Record<string, unknown> | undefined;
				return {
					code: "VALIDATION_ERROR",
					message: (shape.message as string) || "Erro de validação",
					details:
						(data?.validationErrors as Record<string, string[]>) || {},
				};
			}
			default:
				return {
					code: "SERVER_ERROR",
					message: (shape.message as string) || "Erro no servidor",
				};
		}
	}

	// Better Auth error
	if ("status" in err && "message" in err) {
		return {
			code: err.status === 401 ? "UNAUTHORIZED" : "SERVER_ERROR",
			message: (err.message as string) || "Erro desconhecido",
		};
	}

	// Fallback
	return {
		code: "SERVER_ERROR",
		message: "Erro desconhecido",
	};
}

/**
 * Verifica se o erro é um erro de validação com detalhes.
 */
export function isValidationError(
	error: ApiError,
): error is ApiError & { details: Record<string, string[]> } {
	return error.code === "VALIDATION_ERROR" && "details" in error;
}

/**
 * Type guard para ApiError.
 */
export function isApiError(error: unknown): error is ApiError {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		typeof (error as Record<string, unknown>).code === "string"
	);
}

export { API_ERROR_CODES, HTTP_STATUS } from "../types/api";
