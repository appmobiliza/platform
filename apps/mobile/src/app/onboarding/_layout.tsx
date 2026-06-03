import { Stack } from "expo-router";

import { THEME } from "@/lib/theme";
import { useAppColorScheme } from "@/lib/use-app-color-scheme";

export default function OnboardingLayout() {
	const colorScheme = useAppColorScheme();
	const bgColor = THEME[colorScheme].background;

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: bgColor },
			}}
		>
			<Stack.Screen name="unregistered" />
			<Stack.Screen name="basic" />
			<Stack.Screen name="course" />
			<Stack.Screen name="accessibility" />
		</Stack>
	);
}
