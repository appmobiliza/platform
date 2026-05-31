import { LogOut } from "lucide-react-native";
import { View } from "react-native";

import { SettingsButton } from "@/components/settings-button";
import { Icon } from "@/components/ui/icon";

export default function AccessibilityProfile() {
	return (
		<View className="flex-1">
			<SettingsButton title="Tema" label="Sistema" />
			<SettingsButton title="Cor de destaque" label="Azul oceano" />
			<SettingsButton
				title="Estilo de barra de navegação"
				label="Padrão"
			/>
			<SettingsButton
				title="Sair do aplicativo"
				label="Encerra sua sessão e desloga sua conta"
				className="text-destructive"
				variant="destructive"
			>
				<Icon icon={LogOut} size={24} color="--destructive" />
			</SettingsButton>
		</View>
	);
}
