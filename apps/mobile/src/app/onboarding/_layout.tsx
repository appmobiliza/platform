import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

import { useHasProfile, useIsLoggedIn } from "@/lib/auth/store";
import { THEME } from "@/lib/theme";
import { useAppColorScheme } from "@/lib/theme/use-app-color-scheme";

export default function OnboardingLayout() {
	const colorScheme = useAppColorScheme();
	const bgColor = THEME[colorScheme].background;
	const router = useRouter();

	const isLoggedIn = useIsLoggedIn();
	const hasProfile = useHasProfile();

	useEffect(() => {
		if (!isLoggedIn) {
			router.replace("/auth");
			return;
		}

		if (hasProfile) {
			router.replace("/(tabs)");
		}
	}, [isLoggedIn, hasProfile, router]);

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: bgColor },
			}}
		>
			<Stack.Screen name="unregistered" />
			<Stack.Screen name="basic" />
			<Stack.Screen name="academic" />
			<Stack.Screen name="accessibility" />
		</Stack>
	);
}
