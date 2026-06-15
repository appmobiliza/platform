/**
 * Better Auth Client — Native.
 *
 * Versão completa com expoClient para:
 * - Gerenciar cookies de sessão de forma segura via expo-secure-store
 * - Suportar fluxo OAuth (Google) via WebBrowser do Expo
 * - Habilitar deep links para o callback de autenticação
 */

import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
	baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api/auth`,
	plugins: [
		expoClient({
			scheme: "mobiliza",
			storagePrefix: "mobiliza",
			storage: SecureStore,
		}),
	],
});

/**
 * Retorna o cookie de sessão armazenado pelo Better Auth.
 *
 * Em native, o cookie é gerenciado pelo `@better-auth/expo` via
 * `expo-secure-store`. O método `getCookie()` é adicionado ao
 * cliente pelo plugin `expoClient`.
 */
export function getAuthCookie(): string | null {
	return authClient.getCookie?.() ?? null;
}
