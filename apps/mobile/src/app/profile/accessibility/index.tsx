import { View } from "react-native";

import { SettingsButton } from "@/components/settings-button";

export default function AccessibilityProfile() {
	return (
		<View className="flex-1">
			<SettingsButton
				title="Tipo de deficiência"
				label="Deficiência auditiva, baixa visão"
			/>
			<SettingsButton
				title="Observações"
				label="“Prefiro que seja feita a audiodescrição do que está ao meu redor”"
			/>
			<SettingsButton
				title="Interface simplificada"
				label="Altera a página inicial e o processo de requisição de atendimentos"
			/>
		</View>
	);
}
