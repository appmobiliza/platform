import { Stack } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";

import "../global.css";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useIsLoggedIn } from "@/lib/auth-store";
import { THEME } from "@/lib/theme";

// Set the animation options. This is optional.
/* SplashScreen.setOptions({
	duration: 1000,
	fade: true,
}); */

export default function RootLayout() {
	const isLoggedIn = useIsLoggedIn();

	const colorScheme = useColorScheme();
	const bgColor =
		colorScheme === "dark" ? THEME.dark.background : THEME.light.background;

	return (
		<GestureHandlerRootView style={{ flex: 1, backgroundColor: bgColor }}>
			<BottomSheetModalProvider>
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
			</BottomSheetModalProvider>
		</GestureHandlerRootView>
	);
}
