import { MoonIcon, SmartphoneIcon, SunIcon } from "lucide-react-native";

import ProfileLayout from "@/layout/profile";

import BoxOptions from "@/components/box-options";

import { setThemePreference, useThemePreference } from "@/lib/theme-store";

export default function SettingsProfileTheme() {
	const theme = useThemePreference();

	const onSelect = (selected: string[]) => {
		const value = (selected[0] ?? "system") as "light" | "dark" | "system";
		setThemePreference(value);
	};

	return (
		<ProfileLayout
			title="Tema"
			description="Escolha o tema que a aplicação deve seguir"
		>
			<BoxOptions
				options={[
					{ id: "light", label: "Claro", icon: SunIcon },
					{ id: "dark", label: "Escuro", icon: MoonIcon },
					{ id: "system", label: "Sistema", icon: SmartphoneIcon },
				]}
				value={[theme]}
				onChange={onSelect}
				maxSelections={1}
			/>
		</ProfileLayout>
	);
}
