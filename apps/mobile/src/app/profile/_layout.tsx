import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

import { THEME } from "@/lib/theme";

export default function ProfileLayout() {
	const colorScheme = useColorScheme();
	const bgColor =
		colorScheme === "dark" ? THEME.dark.background : THEME.light.background;
	const headerColor = THEME.primary;

	return (
		<Stack
			screenOptions={{
				headerStyle: {
					backgroundColor: headerColor,
				},
				headerTintColor: "#fff",
				headerTitleStyle: {
					color: "#fff",
				},
				headerShadowVisible: false,
				contentStyle: { backgroundColor: bgColor },
			}}
		>
			<Stack.Screen
				name="basic"
				options={{ headerTitle: "Dados pessoais" }}
			/>
			<Stack.Screen
				name="academic"
				options={{ headerTitle: "Dados acadêmicos" }}
			/>
			<Stack.Screen
				name="saved-locations"
				options={{ headerTitle: "Locais salvos" }}
			/>
			<Stack.Screen
				name="accessibility"
				options={{ headerTitle: "Acessibilidade" }}
			/>
			<Stack.Screen
				name="settings"
				options={{ headerTitle: "Configurações" }}
			/>
		</Stack>
	);
}
