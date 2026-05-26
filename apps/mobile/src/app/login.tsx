import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/ui/Logo";

export default function Login() {
	const router = useRouter();

	const handleLogin = () => {
		router.push("/onboarding/unregistered");
	};

	return (
		<View className="flex-1 bg-white">
			{/* Top half: Brand color with logo */}
			<View className="flex-[0.55] items-center justify-center bg-brand-primary rounded-b-3xl">
				<Logo light />
			</View>

			{/* Bottom half: Login Form */}
			<View className="flex-[0.45] px-6 pt-10 pb-8 justify-between">
				<View>
					<Text className="text-2xl font-bold text-neutral-900 mb-2">
						Autenticação
					</Text>
					<Text className="text-base text-neutral-500 leading-relaxed">
						Entre com seu e-mail institucional para acessar a
						plataforma
					</Text>

					<Button className="mt-8 relative" onPress={handleLogin}>
						{/* We would use an actual Google icon here */}
						<Text className="text-white font-semibold text-base">
							G Continuar com o Google
						</Text>
					</Button>

					<Text className="text-center text-sm text-neutral-400 mt-6 leading-relaxed">
						Ao continuar, você concorda com nossos{"\n"}
						<Text className="underline">Termos de Serviço</Text> e{" "}
						<Text className="underline">
							Política de Privacidade
						</Text>
					</Text>
				</View>

				<TouchableOpacity className="items-center py-2">
					<Text className="text-sm text-neutral-500 underline font-medium">
						Entrar como visitante
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
