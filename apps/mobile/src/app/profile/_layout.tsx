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
				contentStyle: { backgroundColor: theme.background },
				headerShown: false,
			}}
		>
			<Stack.Screen name="index" options={{ headerShown: false }} />

			{/* Básico */}
			<Stack.Screen
				name="basic/index"
				options={{
					headerShown: true,
					headerTitle: "Dados pessoais",
					...HEADER_CONFIG(),
				}}
			/>
			<Stack.Screen name="basic/name" />
			<Stack.Screen name="basic/gender" />
			<Stack.Screen name="basic/phone" />
			<Stack.Screen name="basic/email" />
			<Stack.Screen name="basic/cpf" />

			{/* Acadêmico */}
			<Stack.Screen
				name="academic/index"
				options={{
					headerShown: true,
					headerTitle: "Acadêmico",
					...HEADER_CONFIG(),
				}}
			/>
			<Stack.Screen name="academic/course" />
			<Stack.Screen name="academic/shift" />
			<Stack.Screen name="academic/campus" />
			<Stack.Screen name="academic/enrollment" />

			{/* Acessibilidade */}
			<Stack.Screen
				name="accessibility/index"
				options={{
					headerShown: true,
					headerTitle: "Acessibilidade",
					...HEADER_CONFIG(),
				}}
			/>
			<Stack.Screen name="accessibility/disabilities" />
			<Stack.Screen name="accessibility/observation" />

			{/* Configurações */}
			<Stack.Screen
				name="settings/index"
				options={{
					headerShown: true,
					headerTitle: "Configurações",
					...HEADER_CONFIG(),
				}}
			/>
			<Stack.Screen name="settings/theme" />
			<Stack.Screen name="settings/app-bar" />
		</Stack>
	);
}
