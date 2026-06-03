import { Appearance, Pressable, Text } from "react-native";

function toggleTheme() {
	const current = Appearance.getColorScheme();

	Appearance.setColorScheme(current === "dark" ? "light" : "dark");
}

export function ThemeToggle() {
	return (
		<Pressable onPress={toggleTheme}>
			<Text>Trocar tema</Text>
		</Pressable>
	);
}
