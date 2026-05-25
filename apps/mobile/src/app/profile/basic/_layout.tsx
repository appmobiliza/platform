import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { THEME } from "@/lib/theme";

import { HEADER_CONFIG } from "../_layout";

export default function BasicProfileLayout() {
	const colorScheme = useColorScheme();

	return (
		<Stack
			screenOptions={{
				contentStyle: {
					backgroundColor: THEME[colorScheme].background,
				},
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
