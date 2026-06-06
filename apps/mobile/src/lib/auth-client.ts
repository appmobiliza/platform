/**
 * Better Auth Client para o app mobile.
 *
 * Usa o plugin expoClient para:
 * - Gerenciar cookies de sessão de forma segura via expo-secure-store
 * - Suportar fluxo OAuth (Google) via WebBrowser do Expo
 * - Habilitar deep links para o callback de autenticação
 */

import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";

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
