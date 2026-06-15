// hooks/useLightStatusBar.ts

import { useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";

import { useAppColorScheme } from "@/lib/theme/use-app-color-scheme";

export function useLightStatusBar() {
	const colorScheme = useAppColorScheme();

	useFocusEffect(
		useCallback(() => {
			// Light background screen: icons must contrast with the scheme
			StatusBar.setStyle(colorScheme === "dark" ? "light" : "dark");

			return () => {
				// Restore the default for colored-header screens
				StatusBar.setStyle("light");
			};
		}, [colorScheme]), // re-runs if the scheme changes while focused
	);
}
