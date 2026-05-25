import { Link } from "expo-router";
import { View } from "react-native";

import { SettingsButton } from "@/components/settings-button";

export default function BasicProfile() {
	return (
		<View>
			<SettingsButton
				title="Nome"
				label="Fulano da Silva"
				href="/profile/basic/name"
			/>
			<SettingsButton
				title="Gênero"
				label="Masculino"
				href="/profile/basic/gender"
			/>
			<SettingsButton
				title="Número de telefone"
				label="+5582988233221"
				href="/profile/basic/phone"
			/>
			<SettingsButton
				title="E-mail"
				label="fulano@example.com"
				href="/profile/basic/email"
				className="border-none"
			/>
		</View>
	);
}
