import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { THEME } from "@/lib/theme";

import { HEADER_CONFIG } from "../_layout";

export default function BasicProfileLayout() {
	const colorScheme = useColorScheme();
	const bgColor =
		colorScheme === "dark" ? THEME.dark.background : THEME.light.background;

	return (
		<Stack
			screenOptions={{
				contentStyle: { backgroundColor: bgColor },
			}}
		>
			<Stack.Screen
				name="index"
				options={{ headerTitle: "Dados pessoais", ...HEADER_CONFIG }}
			/>
			<Stack.Screen
				name="name"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="gender"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
