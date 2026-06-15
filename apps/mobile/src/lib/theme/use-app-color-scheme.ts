import { useColorScheme } from "react-native";

import { useThemePreference } from "../../stores/theme-store";

/**
 * Returns the effective color scheme by combining the user's stored
 * preference with the system's color scheme.
 *
 * - If the preference is "light" or "dark", that value is returned.
 * - If the preference is "system", the system's `useColorScheme()` is used.
 */
export function useAppColorScheme(): "light" | "dark" {
	const preference = useThemePreference();
	const systemScheme = useColorScheme();

	if (preference === "system") {
		return (systemScheme ?? "light") as "light" | "dark";
	}

	return preference;
}
