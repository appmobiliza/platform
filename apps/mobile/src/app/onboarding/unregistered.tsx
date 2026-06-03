import { useRouter } from "expo-router";
import { CircleAlert } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

export default function Unregistered() {
	const router = useRouter();

	return (
		<View className="flex-1">
			<Header />

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
