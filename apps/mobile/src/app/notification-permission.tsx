import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Linking, View } from "react-native";

import { PermissionLayout } from "@/components/permission-layout";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

function handleOpenSettings() {
	Linking.openSettings();
}

export default function NotificationPermission() {
	const router = useRouter();
	const [hasDenied, setHasDenied] = useState(false);
	const [canAskAgain, setCanAskAgain] = useState(true);
	const [isLoading, setIsLoading] = useState(false);

	async function handleRequestNotification() {
		setIsLoading(true);
		try {
			const { status, canAskAgain: canAsk } =
				await Notifications.requestPermissionsAsync();

			if (status === "granted") {
				router.push("/");
				return;
			}

			setHasDenied(true);
			setCanAskAgain(canAsk);
		} finally {
			setIsLoading(false);
		}
	}

	const showSettingsFallback = hasDenied && !canAskAgain;

	return (
		<PermissionLayout
			headerHref={null}
			title={
				showSettingsFallback
					? "Acesso às notificações negado"
					: "O app precisa do acesso a notificações para funcionar"
			}
		>
			{showSettingsFallback ? (
				<View>
					<Text className="text-base leading-relaxed">
						Você negou o acesso às notificações. Para permitir, vá
						às configurações do seu dispositivo e habilite as
						notificações para este aplicativo.
					</Text>

					<Button className="mt-8" onPress={handleOpenSettings}>
						<Text>Abrir configurações</Text>
					</Button>
				</View>
			) : (
				<View>
					<Text className="text-base leading-relaxed">
						Para receber notificações sobre o status das suas
						solicitações e encontrar contribuintes mais rapidamente,{" "}
						precisamos enviar notificações para você.
					</Text>

					<Button
						className="mt-8"
						onPress={handleRequestNotification}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator
								size="small"
								color="--foreground"
							/>
						) : (
							<Text>Permitir notificações</Text>
						)}
					</Button>
				</View>
			)}
		</PermissionLayout>
	);
}
