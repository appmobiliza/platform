import { VariableContextProvider } from "nativewind";
import { useEffect } from "react";
import { Appearance, type ColorSchemeName, Platform, View } from "react-native";

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
		if (preference === "system") {
			// iOS supports null to reset to system; Android crashes with null,
			// so we read the real system color scheme and apply it instead.
			const systemScheme = Appearance.getColorScheme() ?? "light";
			Appearance.setColorScheme(
				(Platform.OS === "ios"
					? null
					: systemScheme) as ColorSchemeName,
			);
		} else {
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
