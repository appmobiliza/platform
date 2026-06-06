/**
 * Auth Store — Bridge entre Better Auth e o estado reativo da UI.
 *
 * Fornece hooks e utilitários para gerenciar autenticação no app mobile,
 * incluindo cache de informações do usuário em MMKV para acesso rápido.
 */

import { useEffect, useMemo } from "react";
import { Platform } from "react-native";

import { toSessionUser } from "@/types/session";

import { authClient } from "./auth-client";
import { storage } from "./storage";

export enum UserRole {
	Student = "student",
	Scholar = "scholar",
}

// ─── Chaves do cache em MMKV ──────────────────────────────────────────────────

const CACHE_KEYS = {
	userId: "auth-user-id",
	userName: "auth-user-name",
	userEmail: "auth-user-email",
	userImage: "auth-user-image",
	userRole: "auth-user-role",
	hasProfile: "auth-has-profile",
} as const;

// ─── Funções de cache síncrono (MMKV) ─────────────────────────────────────────

export function cacheUserInfo(user: {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	role: string;
}) {
	storage.set(CACHE_KEYS.userId, user.id);
	storage.set(CACHE_KEYS.userName, user.name);
	storage.set(CACHE_KEYS.userEmail, user.email);
	if (user.image) {
		storage.set(CACHE_KEYS.userImage, user.image);
	} else {
		storage.delete(CACHE_KEYS.userImage);
	}
	storage.set(CACHE_KEYS.userRole, user.role);
}

export function clearUserCache() {
	for (const key of Object.values(CACHE_KEYS)) {
		storage.delete(key);
	}
}

export function getCachedUser() {
	return {
		id: storage.getString(CACHE_KEYS.userId) ?? "",
		name: storage.getString(CACHE_KEYS.userName) ?? "",
		email: storage.getString(CACHE_KEYS.userEmail) ?? "",
		image: storage.getString(CACHE_KEYS.userImage) ?? null,
		role:
			(storage.getString(CACHE_KEYS.userRole) as UserRole) ??
			UserRole.Student,
	};
}

export function setHasProfile(value: boolean) {
	storage.set(CACHE_KEYS.hasProfile, String(value));
}

export function getHasProfile(): boolean {
	return storage.getString(CACHE_KEYS.hasProfile) === "true";
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Sincroniza a sessão do Better Auth para o cache (localStorage) na web.
 *
 * Em OAuth (Google), o login causa um redirect completo do navegador,
 * destruindo o contexto JS antes de `cacheUserInfo` ser chamado em
 * `auth.tsx`. Este hook garante que o cache seja preenchido sempre
 * que a sessão for restaurada (cookie persistente), rodando apenas
 * em plataforma web.
 */
export function useSyncSessionCache() {
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (Platform.OS !== "web") return;
		if (isPending || !session?.user) return;

		const user = toSessionUser(session.user as Record<string, unknown>);
		if (!user) return;

		cacheUserInfo({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role,
		});
	}, [session, isPending]);
}

/**
 * Indica se o usuário está autenticado.
 *
 * Durante o carregamento inicial da sessão (isPending do Better Auth),
 * usa o cache síncrono do MMKV como fallback para evitar flash de tela.
 */
export function useIsLoggedIn(): boolean {
	const { data: session, isPending } = authClient.useSession();

	// Fallback síncrono durante carregamento do SecureStore
	if (isPending) {
		return storage.getString(CACHE_KEYS.userRole) !== undefined;
	}

	return session !== null;
}

/**
 * Retorna o papel do usuário autenticado.
 * Durante carregamento, lê do cache MMKV (síncrono).
 */
export function useUserRole(): UserRole {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		const cachedRole = storage.getString(CACHE_KEYS.userRole);
		if (cachedRole === UserRole.Scholar) return UserRole.Scholar;
		return UserRole.Student;
	}

	const user = toSessionUser(session?.user as Record<string, unknown>);

	if (user?.role === UserRole.Scholar) return UserRole.Scholar;
	return UserRole.Student;
}

/**
 * Retorna dados básicos do usuário da sessão.
 * Os dados são cacheados em MMKV e atualizados sempre que a sessão muda.
 */
export function useUser() {
	const { data: session } = authClient.useSession();

	return useMemo(() => {
		const user = toSessionUser(session?.user as Record<string, unknown>);

		if (!user) {
			return getCachedUser();
		}

		return {
			id: user.id ?? "",
			name: user.name ?? "",
			email: user.email ?? "",
			image: user.image ?? null,
			role: (user.role as UserRole) ?? UserRole.Student,
		};
	}, [session]);
}

/**
 * Indica se o usuário já possui um perfil completo (onboarding finalizado).
 *
 * - Scholars sempre têm perfil (criado pelo gestor).
 * - Students têm perfil após finalizar o onboarding.
 */
export function useHasProfile(): boolean {
	const role = useUserRole();

	if (role === UserRole.Scholar) return true;

	return getHasProfile();
}
