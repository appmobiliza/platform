import { useRouter } from "expo-router";
import { CircleAlert } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "../../components/old/Button_test";
import { Header } from "../../components/old/Header";

export default function Unregistered() {
	const router = useRouter();

	return (
		<View className="flex-1 bg-white">
			<Header onBack={() => router.replace("/login")} />

			<View className="flex-1 px-6 pt-10 pb-8 justify-between">
				<View>
					<View className="mb-6">
						<CircleAlert size={36} color="#171717" />
					</View>

					<Text className="text-3xl font-bold text-neutral-900 leading-tight mb-4">
						Parece que você ainda não está cadastrado no Mobiliza
					</Text>

					<Text className="text-base text-neutral-800 leading-relaxed">
						Para solicitar atendimentos, você precisa estar
						cadastrado no programa.
					</Text>

					<Button
						className="mt-8"
						onPress={() => router.push("/onboarding/basic")}
					>
						Realizar cadastro
					</Button>
				</View>

				<View className="items-center">
					<Text className="text-sm text-neutral-400">
						Precisando de ajuda?
					</Text>
					<TouchableOpacity className="mt-1">
						<Text className="text-sm text-neutral-500 underline font-medium">
							Entre em contato com o NAC
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}
