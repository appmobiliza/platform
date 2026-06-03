import { MoonIcon, SmartphoneIcon, SunIcon } from "lucide-react-native";
import { useState } from "react";

import ProfileLayout from "@/layout/profile";

import BoxOptions from "@/components/box-options";

export default function SettingsProfileTheme() {
	const [themes, setThemes] = useState<string[]>([]);

	const onSelect = (selected: string[]) => {
		console.log("Tema selecionado:", selected);
		setThemes(selected);
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
				value={themes}
				onChange={onSelect}
				maxSelections={1}
			/>
		</ProfileLayout>
	);
}
