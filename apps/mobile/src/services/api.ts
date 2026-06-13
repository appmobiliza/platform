/**
 * API Service Module
 * Funções para comunicação com a API do Mobiliza
 */

import type {
	ApiError,
	AuthResponse,
	OnboardingApiRequest,
	OnboardingResponse,
	SessionResponse,
	UserResponse,
} from "../types/api";
import { API_ERROR_CODES, HTTP_STATUS } from "../types/api";

// ============================================
// CONFIG
// ============================================

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_URL || "http://localhost:3001";

const endpoints = {
	user: {
		onboarding: "/api/onboarding",
		byId: (id: string) => `/api/user/${id}`,
	},
} as const;

// ============================================
// ERROR PARSING
// ============================================

/**
 * Parse error response from API
 */
export function parseApiError(response: unknown): ApiError {
	if (!response || typeof response !== "object") {
		return {
			code: "NETWORK_ERROR" as const,
			message: "Erro de conexão",
		};
	}

	const res = response as Record<string, unknown>;

	// Validation error (422)
	if (res.code === "VALIDATION_ERROR") {
		return {
			code: "VALIDATION_ERROR",
			message: (res.message as string) || "Erro de validação",
			details: (res.details as Record<string, string[]>) || {},
		};
	}

	// Server error (500)
	if (res.code === "SERVER_ERROR" || res.code === "INTERNAL_ERROR") {
		return {
			code: res.code,
			message: (res.message as string) || "Erro no servidor",
		};
	}

	// Network error
	if (res.code === "NETWORK_ERROR") {
		return {
			code: "NETWORK_ERROR",
			message: (res.message as string) || "Erro de conexão",
		};
	}

	// Unauthorized
	if (res.code === "UNAUTHORIZED" || res.code === "INVALID_TOKEN") {
		return {
			code: res.code,
			message: (res.message as string) || "Não autorizado",
		};
	}

	// Default error
	return {
		code: "SERVER_ERROR",
		message: "Erro desconhecido",
	};
}

/**
 * Check if error is a validation error
 */
export function isValidationError(
	error: ApiError,
): error is ApiError & { details: Record<string, string[]> } {
	return error.code === "VALIDATION_ERROR" && "details" in error;
}

// ============================================
// FETCH WRAPPER
// ============================================

/**
 * Custom fetch with error handling
 */
export async function fetchApi<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	const defaultHeaders: HeadersInit = {
		"Content-Type": "application/json",
	};

	// Add auth token if available
	const token =
		options.headers?.Authorization || options.headers?.authorization;
	if (token) {
		defaultHeaders.Authorization = token;
	}

	try {
		const response = await fetch(url, {
			...options,
			headers: {
				...defaultHeaders,
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw parseApiError(errorData);
		}

		return response.json() as Promise<T>;
	} catch (error) {
		if (isApiError(error)) {
			throw error;
		}
		// Network error
		throw parseApiError({
			code: "NETWORK_ERROR",
			message: "Erro de conexão com o servidor",
		});
	}
}

/**
 * Custom fetch targeting the web app (Next.js route handler).
 *
 * Usada para chamadas de autenticação que precisam de
 * `credentials: "include"` para enviar cookies de sessão
 * ao domínio do Next.js, evitando problemas com cross-domain
 * cookies que ocorriam ao chamar a API diretamente.
 */
export async function fetchWebApi<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const url = `${WEB_BASE_URL}${endpoint}`;

	const defaultHeaders: Record<string, string> = {
		"Content-Type": "application/json",
	};

	// Add auth token if available
	const optionsHeaders = options.headers as Record<string, string> | undefined;
	const token =
		optionsHeaders?.Authorization || optionsHeaders?.authorization;
	if (token) {
		defaultHeaders.Authorization = token;
	}

	try {
		const response = await fetch(url, {
			...options,
			credentials: "include",
			headers: {
				...defaultHeaders,
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw parseApiError(errorData);
		}

		return response.json() as Promise<T>;
	} catch (error) {
		if (isApiError(error)) {
			throw error;
		}
		// Network error
		throw parseApiError({
			code: "NETWORK_ERROR",
			message: "Erro de conexão com o servidor",
		});
	}
}

/**
 * Type guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		typeof (error as Record<string, unknown>).code === "string"
	);
}

// ============================================
// DATA TRANSFORMATIONS
// ============================================

/**
 * Transform UserResponse to frontend User type
 * API returns snake_case, frontend uses camelCase internally
 */
export function transformUserResponseToUser(apiUser: UserResponse) {
	return {
		id: apiUser.id,
		basicInfo: {
			name: apiUser.name,
			phone: apiUser.phone,
			gender: apiUser.gender,
		},
		courseInfo: {
			course: apiUser.course,
			shift: apiUser.shift,
			campus: apiUser.campus,
			matricula: apiUser.matricula,
		},
		accessibilityPrefs: {
			disabilityType: apiUser.accessibility.disabilityType,
			needsAudioDescription: apiUser.accessibility.needsAudioDescription,
		},
	};
}

/**
 * Transform OnboardingData to API request format
 * Frontend uses camelCase, API expects snake_case
 */
export function transformOnboardingDataToApiRequest(data: {
	name: string;
	phone: string;
	gender: string;
	course: string;
	shift: string;
	campus: string;
	matricula: string;
	disabilityType: string[];
	needsAudioDescription: boolean;
}): OnboardingApiRequest {
	return {
		name: data.name,
		phone: data.phone,
		gender: data.gender,
		course: data.course,
		shift: data.shift,
		campus: data.campus,
		matricula: data.matricula,
		accessibility: {
			disabilityType: data.disabilityType,
			needsAudioDescription: data.needsAudioDescription,
		},
	};
}

// ============================================
// AUTH API
// ============================================

/**
 * Send Google auth token to web app (Next.js route handler)
 *
 * A autenticação foi movida para o app Next.js em
 * `{EXPO_PUBLIC_WEB_URL}/api/auth` para evitar problemas com
 * cross-domain cookies. As chamadas de auth agora usam
 * `credentials: "include"` e apontam para o servidor Next.js.
 */
export async function authenticateWithGoogle(
	googleToken: string,
): Promise<AuthResponse> {
	return fetchWebApi<AuthResponse>("/api/auth/callback/google", {
		method: "POST",
		body: JSON.stringify({ idToken: googleToken }),
	});
}

/**
 * Validate session token via web app (Better Auth route handler)
 */
export async function validateSession(token: string): Promise<SessionResponse> {
	return fetchWebApi<SessionResponse>("/api/auth/session", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}

/**
 * Logout (invalidate session via web app)
 */
export async function logout(): Promise<{ success: boolean }> {
	return fetchWebApi<{ success: boolean }>("/api/auth/sign-out", {
		method: "POST",
	});
}

// ============================================
// USER API
// ============================================

/**
 * Submit onboarding data
 */
export async function submitOnboarding(
	data: OnboardingApiRequest,
	token: string,
): Promise<OnboardingResponse> {
	return fetchApi<OnboardingResponse>(endpoints.user.onboarding, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(data),
	});
}

/**
 * Get user by ID
 */
export async function getUserById(
	userId: string,
	token: string,
): Promise<UserResponse> {
	return fetchApi<UserResponse>(endpoints.user.byId(userId), {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}

// ============================================
// EXPORTS
// ============================================

export { API_ERROR_CODES, endpoints, HTTP_STATUS, WEB_BASE_URL };
