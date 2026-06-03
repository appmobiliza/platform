/**
 * API Response Types
 * Tipos para responses da API do Mobiliza
 */

// ============================================
// AUTH TYPES
// ============================================

export interface AuthResponse {
	token: string;
	user: UserResponse;
}

export interface SessionResponse {
	valid: boolean;
	user?: UserResponse;
}

// ============================================
// USER TYPES
// ============================================

export interface AccessibilityApiResponse {
	disabilityType: string[];
	needsAudioDescription: boolean;
}

export interface UserResponse {
	id: string;
	name: string;
	phone: string;
	gender: string;
	course: string;
	shift: string;
	campus: string;
	matricula: string;
	accessibility: AccessibilityApiResponse;
	createdAt: string;
}

export interface OnboardingResponse {
	success: boolean;
	user: UserResponse;
}

// ============================================
// API ERROR TYPES
// ============================================

export interface ApiErrorDetail {
	code: string;
	message: string;
}

export interface ApiValidationError {
	code: "VALIDATION_ERROR";
	message: string;
	details: Record<string, string[]>;
}

export interface ApiServerError {
	code: "SERVER_ERROR" | "INTERNAL_ERROR";
	message: string;
}

export interface ApiNetworkError {
	code: "NETWORK_ERROR";
	message: string;
}

export interface ApiUnauthorizedError {
	code: "UNAUTHORIZED" | "INVALID_TOKEN";
	message: string;
}

export type ApiError =
	| ApiValidationError
	| ApiServerError
	| ApiNetworkError
	| ApiUnauthorizedError;

// ============================================
// REQUEST TYPES
// ============================================

export interface GoogleAuthRequest {
	googleToken: string;
}

export interface SessionValidationRequest {
	token: string;
}

export interface OnboardingApiRequest {
	name: string;
	phone: string;
	gender: string;
	course: string;
	shift: string;
	campus: string;
	matricula: string;
	accessibility: AccessibilityApiResponse;
}

// ============================================
// HTTP STATUS
// ============================================

export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	VALIDATION_ERROR: 422,
	SERVER_ERROR: 500,
} as const;

// ============================================
// API ERROR CODES
// ============================================

export const API_ERROR_CODES = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	SERVER_ERROR: "SERVER_ERROR",
	INTERNAL_ERROR: "INTERNAL_ERROR",
	NETWORK_ERROR: "NETWORK_ERROR",
	UNAUTHORIZED: "UNAUTHORIZED",
	INVALID_TOKEN: "INVALID_TOKEN",
} as const;
