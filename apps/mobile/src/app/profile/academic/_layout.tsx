import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { THEME } from "@/lib/theme";

import { HEADER_CONFIG } from "../_layout";

export default function AcademicProfileLayout() {
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
				options={{ headerTitle: "Acadêmico", ...HEADER_CONFIG }}
			/>
			<Stack.Screen
				name="course"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
