import { Stack } from "expo-router";
import { View } from "react-native";

import { useUserRole } from "@/lib/auth-store";
import { SCHOLAR_THEME, THEME, useUnstableNativeVariable } from "@/lib/theme";
import { useAppColorScheme } from "@/lib/use-app-color-scheme";

export default function ProfileLayout() {
	const colorScheme = useAppColorScheme();
	const role = useUserRole();
	const isScholar = role === "scholar";
	const primary = useUnstableNativeVariable("--primary") as string;

	const theme = isScholar ? SCHOLAR_THEME[colorScheme] : THEME[colorScheme];

	const headerConfig = {
		headerStyle: {
			backgroundColor: primary,
		},
		headerTintColor: "#fff",
		headerTitleStyle: {
			color: "#fff",
		},
		headerShadowVisible: false,
	};

	return (
		<View style={{ flex: 1, backgroundColor: theme.background }}>
			<Stack
				screenOptions={{
					contentStyle: { backgroundColor: theme.background },
					headerShown: false,
				}}
			>
				{/* Básico */}
				<Stack.Screen
					name="basic/index"
					options={{
						headerShown: true,
						headerTitle: "Dados pessoais",
						...headerConfig,
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
						...headerConfig,
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
						...headerConfig,
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
						...headerConfig,
					}}
				/>
				<Stack.Screen name="settings/theme" />
				<Stack.Screen name="settings/app-bar" />
			</Stack>
		</View>
	);
}
