import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";

import { Toaster } from "@/components/ui/toast";

import "../global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
	useHasProfile,
	useIsLoggedIn,
	useSyncSessionCache,
} from "@/lib/auth-store";
import { THEME } from "@/lib/theme";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { useAppColorScheme } from "@/lib/use-app-color-scheme";

import { ThemeProvider } from "@/providers/theme-provider";

// Set the animation options. This is optional.
SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function RootLayout() {
	useSyncSessionCache();

	const isLoggedIn = useIsLoggedIn();
	const hasProfile = useHasProfile();

	// For background we can rely on NativeWind, but if we need the RN style,
	// we should probably derive it from the scheme.
	// For now we keep using the THEME constant for the base background.
	const colorScheme = useAppColorScheme();
	const bgColor = THEME[colorScheme ?? "light"].background;

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<TRPCProvider>
				<ThemeProvider>
					<BottomSheetModalProvider>
						<Stack
							screenOptions={{
								headerShown: false,
								contentStyle: { backgroundColor: bgColor },
							}}
						>
							{/* Main app — requires autenticação E perfil completo */}
							<Stack.Protected guard={isLoggedIn && hasProfile}>
								<Stack.Screen name="(tabs)" />
							</Stack.Protected>

							{/* Onboarding — requer autenticação, mas ainda sem perfil */}
							<Stack.Protected guard={isLoggedIn && !hasProfile}>
								<Stack.Screen name="onboarding" />
							</Stack.Protected>

							{/* Tela de login — apenas quando deslogado */}
							<Stack.Protected guard={!isLoggedIn}>
								<Stack.Screen name="auth" />
							</Stack.Protected>
						</Stack>
						<View
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
							}}
							pointerEvents="box-none"
						>
							<PortalHost />
							<Toaster />
						</View>
					</BottomSheetModalProvider>
				</ThemeProvider>
			</TRPCProvider>
		</GestureHandlerRootView>
	);
}
