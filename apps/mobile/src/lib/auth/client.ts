/**
 * Better Auth Client — Web.
 *
 * Versão simplificada sem expoClient: o navegador gerencia cookies de
 * sessão nativamente. Não usamos expo-secure-store nem expoClient aqui,
 * pois esses módulos não são compatíveis com ambientes web.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: `${process.env.EXPO_PUBLIC_BETTER_AUTH_URL}/api/auth`,
});

/**
 * Retorna o cookie de sessão armazenado pelo Better Auth.
 *
 * Em plataforma web, o navegador gerencia cookies nativamente via
 * `credentials: "include"`, então esta função retorna `null`.
 * Em native, o cookie é gerenciado pelo `@better-auth/expo` via
 * `expo-secure-store` e é retornado por este método.
 *
 * A implementação nativa está em `client.native.ts`, que o Metro
 * resolve automaticamente em dispositivos iOS/Android.
 */
export function getAuthCookie(): string | null {
	return (authClient as { getCookie?: () => string | null }).getCookie?.() ?? null;
}
