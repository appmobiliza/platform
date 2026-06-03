/**
 * Better Auth Client para o app mobile.
 *
 * Usa o plugin expoClient para:
 * - Gerenciar cookies de sessão de forma segura via expo-secure-store
 * - Suportar fluxo OAuth (Google) via WebBrowser do Expo
 * - Habilitar deep links para o callback de autenticação
 */

import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const getBaseUrl = () => {
	if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

	// Android emulator — 10.0.2.2 reaches host machine
	// if (Platform.OS === "android") {
	// 	return "http://10.0.2.2:3001";
	// }

	// Default: ngrok URL for device testing
	return "https://unmaidenlike-unaborted-jaelyn.ngrok-free.dev";
};

export const authClient = createAuthClient({
	baseURL: `${getBaseUrl()}/api/auth`,
	plugins: [
		expoClient({
			scheme: "mobiliza",
			storagePrefix: "mobiliza",
			storage: SecureStore,
		}),
	],
});
