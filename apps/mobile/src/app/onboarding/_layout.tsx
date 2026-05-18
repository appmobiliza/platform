import { Stack } from "expo-router";

export default function OnboardingLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: "#ffffff" },
			}}
		>
			<Stack.Screen name="unregistered" />
			<Stack.Screen name="basic" />
			<Stack.Screen name="course" />
			<Stack.Screen name="accessibility" />
		</Stack>
	);
}
