import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { THEME } from "@/lib/theme";

export default function OnboardingLayout() {
	const colorScheme = useColorScheme();
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
