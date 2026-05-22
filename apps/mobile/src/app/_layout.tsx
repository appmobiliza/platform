import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import "../global.css";

// Set the animation options. This is optional.
SplashScreen.setOptions({
	duration: 1000,
	fade: true,
});

export default function RootLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
			<Stack.Screen name="login" />
			<Stack.Screen name="onboarding" />
			<Stack.Screen name="estudante" />
		</Stack>
	);
}
