import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { useUserRole } from "@/lib/auth-store";
import { SCHOLAR_THEME, THEME, useUnstableNativeVariable } from "@/lib/theme";

export const HEADER_CONFIG = () => {
	const primary = useUnstableNativeVariable("--primary") as string;

	return {
		headerStyle: {
			backgroundColor: primary,
		},
		headerTintColor: "#fff",
		headerTitleStyle: {
			color: "#fff",
		},
		headerShadowVisible: false,
	};
};

export default function ProfileLayout() {
	const colorScheme = useColorScheme();
	const role = useUserRole();
	const isScholar = role === "scholar";
	const theme = isScholar
		? SCHOLAR_THEME
		: colorScheme === "dark"
			? THEME.dark
			: THEME.light;

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: { backgroundColor: theme.background },
			}}
		/>
	);
}
