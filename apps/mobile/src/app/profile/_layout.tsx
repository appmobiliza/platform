import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { THEME } from "@/lib/theme";

export const HEADER_CONFIG = {
	headerStyle: {
		backgroundColor: THEME.dark.primary,
	},
	headerTintColor: "#fff",
	headerTitleStyle: {
		color: "#fff",
	},
	headerShadowVisible: false,
};

export default function ProfileLayout() {
	const colorScheme = useColorScheme();
	const bgColor =
		colorScheme === "dark" ? THEME.dark.background : THEME.light.background;

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: bgColor },
			}}
		/>
	);
}
