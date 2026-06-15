import { VariableContextProvider } from "nativewind";
import { useEffect } from "react";
import { Appearance, Platform, View } from "react-native";

import { THEME, useThemeVariables } from "@/lib/theme";
import { useAppColorScheme } from "@/lib/theme/use-app-color-scheme";

import { useThemePreference } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const theme = useThemeVariables();
	const colorScheme = useAppColorScheme();
	const preference = useThemePreference();
	const bgColor = THEME[colorScheme].background;

	useEffect(() => {
		if (Platform.OS === "web") {
			if (preference === "system") {
				document.documentElement.style.colorScheme = "";
			} else {
				document.documentElement.style.colorScheme = preference;
			}
		} else {
			if (preference === "system") {
				Appearance.setColorScheme("unspecified");
			} else {
				Appearance.setColorScheme(preference);
			}
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
