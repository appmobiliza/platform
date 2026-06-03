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

	useEffect(() => {
		if (preference === "system") {
			Appearance.setColorScheme("unspecified");
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
