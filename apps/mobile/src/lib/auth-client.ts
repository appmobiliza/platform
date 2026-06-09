/**
 * Better Auth Client — Web.
 *
 * Versão simplificada sem expoClient: o navegador gerencia cookies de
 * sessão nativamente. Não usamos expo-secure-store nem expoClient aqui,
 * pois esses módulos não são compatíveis com ambientes web.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api/auth`,
});
