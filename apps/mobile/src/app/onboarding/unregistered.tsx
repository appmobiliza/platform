import { useRouter } from "expo-router";
import { CircleAlert } from "lucide-react-native";
import { View } from "react-native";

import { Header } from "@/components/header";
import { NacContact } from "@/components/nac-contact";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { authClient } from "@/lib/auth/client";
import { clearUserCache } from "@/lib/auth/store";

export default function Unregistered() {
	const router = useRouter();

	return (
		<View className="flex-1">
			<Header
				onClick={async () => {
					await authClient.signOut();
					clearUserCache();
				}}
			/>

			<View className="flex-1 px-6 pt-24 pb-8 justify-between">
				<View>
					<View className="mb-6">
						<Icon
							icon={CircleAlert}
							size={36}
							color="--foreground"
						/>
					</View>

					<Text className="text-3xl font-bold leading-tight mb-4">
						Parece que você ainda não está cadastrado no Mobiliza
					</Text>

					<Text className="text-base leading-relaxed">
						Para solicitar atendimentos, você precisa estar
						cadastrado no programa.
					</Text>

					<Button
						className="mt-8"
						onPress={() => router.push("/onboarding/basic")}
					>
						<Text>Realizar cadastro</Text>
					</Button>
				</View>

				<NacContact className="items-center" />
			</View>
		</View>
	);
}
