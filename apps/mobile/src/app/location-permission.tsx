import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Linking, View } from "react-native";

import { PermissionLayout } from "@/components/permission-layout";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

function handleOpenSettings() {
	Linking.openSettings();
}

export default function LocationPermission() {
	const router = useRouter();
	const [hasDenied, setHasDenied] = useState(false);
	const [canAskAgain, setCanAskAgain] = useState(true);
	const [isLoading, setIsLoading] = useState(false);

	function handleRequestLocation() {
		setIsLoading(true);
		Location.requestForegroundPermissionsAsync()
			.then(({ granted, canAskAgain: canAsk }) => {
				if (granted) {
					router.push("/");
					return;
				}

				setHasDenied(true);
				setCanAskAgain(canAsk);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}

	const showSettingsFallback = hasDenied && !canAskAgain;

	return (
		<PermissionLayout
			headerHref={null}
			title={
				showSettingsFallback
					? "Acesso à localização negado"
					: "O app precisa do acesso a sua localização para funcionar"
			}
		>
			{showSettingsFallback ? (
				<View>
					<Text className="text-base leading-relaxed">
						Você negou o acesso à localização. Para permitir, vá às
						configurações do seu dispositivo e habilite o acesso à
						localização para este aplicativo.
					</Text>

					<Button className="mt-8" onPress={handleOpenSettings}>
						<Text>Abrir configurações</Text>
					</Button>
				</View>
			) : (
				<View>
					<Text className="text-base leading-relaxed">
						Para permitir, você precisa fazer o seguinte: {"\n"}
						1. Selecionar a opção{" "}
						<Text className="font-semibold">"Precisa"</Text>
						{"\n"}
						2. Pressionar{" "}
						<Text className="font-semibold">
							"Durante o uso do app"
						</Text>
					</Text>

					<Button
						className="mt-8"
						onPress={handleRequestLocation}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator
								size="small"
								color="--foreground"
							/>
						) : (
							<Text>Permitir acesso à localização</Text>
						)}
					</Button>
				</View>
			)}
		</PermissionLayout>
	);
}
