import { useState } from "react";
import { View } from "react-native";

import { SettingsButton } from "@/components/settings-button";
import { Switch } from "@/components/ui/switch";

export default function AccessibilityProfile() {
	const [simplifiedInterface, setSimplifiedInterface] = useState(false);

	const handleSimplifiedInterfaceChange = (value: boolean) => {
		setSimplifiedInterface(value);
	};

	return (
		<View className="flex-1">
			<SettingsButton
				title="Tipo de deficiência"
				label="Deficiência auditiva, baixa visão"
				href="/profile/accessibility/disabilities"
			/>
			<SettingsButton
				title="Observações"
				label="“Prefiro que seja feita a audiodescrição do que está ao meu redor”"
				href="/profile/accessibility/observation"
			/>
			<SettingsButton
				title="Interface simplificada"
				label="Altera a página inicial e o processo de requisição de atendimentos"
			>
				<Switch
					checked={simplifiedInterface}
					onCheckedChange={handleSimplifiedInterfaceChange}
				/>
			</SettingsButton>
		</View>
	);
}
