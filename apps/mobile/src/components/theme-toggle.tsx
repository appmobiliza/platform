import { Appearance, Pressable, Text } from "react-native";

export function ThemeToggle() {
	function toggleTheme() {
		const current = Appearance.getColorScheme();

		Appearance.setColorScheme(current === "dark" ? "light" : "dark");
	}

	return (
		<Pressable onPress={toggleTheme}>
			<Text>Trocar tema</Text>
		</Pressable>
	);
}
