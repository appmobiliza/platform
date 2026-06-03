import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { Platform, View } from "react-native";

import { SettingsButton } from "@/components/settings-button";
import { Icon } from "@/components/ui/icon";

import { setIsLoggedIn, useIsLoggedIn } from "@/lib/auth-store";
import { useThemePreference } from "@/lib/theme-store";

const THEME_LABELS: Record<string, string> = {
	light: "Claro",
	dark: "Escuro",
	system: "Sistema",
};

export default function SettingsProfile() {
	const router = useRouter();
	const theme = useThemePreference();
	const isLoggedIn = useIsLoggedIn();

	return (
		<View>
			<SettingsButton
				title="Tema"
				label={THEME_LABELS[theme] ?? "Sistema"}
				href="/profile/settings/theme"
			/>
			<SettingsButton
				title="Cor de destaque"
				label="Azul oceano"
				disabled
			/>
			{Platform.OS === "web" && (
				<SettingsButton
					title="Estilo de barra de navegação"
					label="Padrão"
					href="/profile/settings/app-bar"
				/>
			)}
			<SettingsButton
				title="Sair do aplicativo"
				label="Encerra sua sessão e desloga sua conta"
				className="text-destructive"
				variant="destructive"
				onPress={() => {
					setIsLoggedIn(false);
					router.replace("/auth");
					console.log("Logged out", isLoggedIn);
				}}
			>
				<Icon icon={LogOut} size={24} color="--destructive" />
			</SettingsButton>
		</View>
	);
}
