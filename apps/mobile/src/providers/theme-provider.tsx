import { VariableContextProvider } from "nativewind";
import { useEffect } from "react";
import { Appearance, View } from "react-native";

import { THEME, useThemeVariables } from "@/lib/theme";
import { useThemePreference } from "@/lib/theme-store";
import { useAppColorScheme } from "@/lib/use-app-color-scheme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const theme = useThemeVariables();
	const colorScheme = useAppColorScheme();
	const preference = useThemePreference();
	const bgColor = THEME[colorScheme].background;

	// Sync the effective color scheme to React Native's Appearance API.
	// This ensures NativeWind dark mode classes and native components
	// respect a user-chosen override. When the preference is "system"
	// we skip the call because:
	//   1. Native code already follows the system automatically.
	//   2. Passing null ("reset") crashes on Android — the Kotlin
	//      parameter is declared non-null.
	useEffect(() => {
		if (preference !== "system") {
			Appearance.setColorScheme(preference);
		}
	}, [preference]);

	return (
		<VariableContextProvider value={theme}>
			<View
				style={{ flex: 1, backgroundColor: bgColor }}
				{...({ colorScheme } as any)}
			>
				{children}
			</View>
		</VariableContextProvider>
	);
}
