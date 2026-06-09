import { Pressable, Text } from "react-native";

import { getThemePreference, setThemePreference } from "@/lib/theme-store";

function toggleTheme() {
	const current = getThemePreference();

	setThemePreference(current === "dark" ? "light" : "dark");
}

export function ThemeToggle() {
	return (
		<Pressable onPress={toggleTheme}>
			<Text>Trocar tema</Text>
		</Pressable>
	);
}
