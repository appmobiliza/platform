import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { KeyboardProvider } from "react-native-keyboard-controller";

import "../global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useIsLoggedIn } from "@/lib/auth-store";
import { THEME } from "@/lib/theme";

import { ThemeProvider } from "@/providers/theme-provider";

// Set the animation options. This is optional.
SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function RootLayout() {
	const isLoggedIn = useIsLoggedIn();

	const colorScheme = useColorScheme();
	// For background we can rely on NativeWind, but if we need the RN style,
	// we should probably derive it from the scheme.
	// For now we keep using the THEME constant for the base background.
	const bgColor = THEME[colorScheme ?? "light"].background;

	return (
		<GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
			<ThemeProvider>
				<BottomSheetModalProvider>
					<KeyboardProvider>
						<Stack
							screenOptions={{
								headerShown: false,
								contentStyle: { backgroundColor: bgColor },
							}}
						>
							<Stack.Protected guard={isLoggedIn}>
								<Stack.Screen name="(tabs)" />
							</Stack.Protected>

							<Stack.Protected guard={!isLoggedIn}>
								<Stack.Screen name="auth" />
								<Stack.Screen name="onboarding" />
							</Stack.Protected>
						</Stack>
					</KeyboardProvider>
				</BottomSheetModalProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
