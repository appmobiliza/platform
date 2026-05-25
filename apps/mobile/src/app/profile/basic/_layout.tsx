import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { THEME } from "@/lib/theme";

export default function BasicProfileLayout() {
	const colorScheme = useColorScheme();
	const bgColor =
		colorScheme === "dark" ? THEME.dark.background : THEME.light.background;

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: bgColor },
			}}
		>
			<Stack.Screen
				name="name"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
