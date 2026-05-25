import { View } from "react-native";

import { SettingsButton } from "@/components/settings-button";

export default function BasicProfile() {
	return (
		<View>
			<SettingsButton title="Nome" label="Fulano da Silva" />
			<SettingsButton title="Gênero" label="Masculino" />
			<SettingsButton title="Número de telefone" label="+5582988233221" />
			<SettingsButton
				title="E-mail"
				label="fulano@example.com"
				className="border-none"
			/>
		</View>
	);
}
