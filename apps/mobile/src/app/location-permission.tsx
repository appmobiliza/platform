import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { CircleAlert } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
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
		<View className="flex-1">
			<Header href={undefined} />

			<View className="flex-1 px-6 pt-36 pb-8 justify-between">
				<View>
					<View className="mb-6">
						<Icon
							icon={CircleAlert}
							size={36}
							color="--foreground"
						/>
					</View>

					{showSettingsFallback ? (
						<>
							<Text className="text-3xl font-bold leading-tight mb-4">
								Acesso à localização negado
							</Text>

							<Text className="text-base leading-relaxed">
								Você negou o acesso à localização. Para
								permitir, vá às configurações do seu dispositivo
								e habilite o acesso à localização para este
								aplicativo.
							</Text>

							<Button
								className="mt-8"
								onPress={handleOpenSettings}
							>
								<Text>Abrir configurações</Text>
							</Button>
						</>
					) : (
						<>
							<Text className="text-3xl font-bold leading-tight mb-4">
								O app precisa do acesso a sua localização para
								funcionar
							</Text>

							<Text className="text-base leading-relaxed">
								Para permitir, você precisa fazer o seguinte:{" "}
								{"\n"}
								1. Selecionar a opção{" "}
								<Text className="font-semibold">“Precisa”</Text>
								{"\n"}
								2. Pressionar{" "}
								<Text className="font-semibold">
									“Durante o uso do app”
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
						</>
					)}
				</View>

				<View className="items-center">
					<Text className="text-sm text-neutral-400">
						Precisando de ajuda?
					</Text>
					<Pressable className="mt-1">
						<Text className="text-sm text-muted-foreground underline font-medium">
							Entre em contato com o NAC
						</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}
