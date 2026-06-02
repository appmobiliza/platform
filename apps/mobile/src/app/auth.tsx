import { useRouter } from "expo-router";
import { Linking, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { setIsLoggedIn, setUserRole } from "@/lib/auth-store";

import GoogleIcon from "@/assets/google";
import { Logo } from "@/assets/logo";

export default function Auth() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	const handleLogin = (role: "student" | "scholar") => {
		setUserRole(role);
		setIsLoggedIn(true);
		router.replace("/(tabs)");
	};

	const openURL = (url: string) => {
		Linking.openURL(url).catch((err) => {
			console.error("Failed to open URL:", err);
		});
	};

	return (
		<View className="flex-1">
			{/* Top half: Brand color with logo */}
			<View
				className="flex-[0.5] items-center justify-center bg-primary"
				style={{ paddingTop: insets.top }}
			>
				<Logo />
			</View>

			{/* Bottom half: Login Form */}
			<View className="flex-[0.5] px-6 pt-10 justify-center pb-16">
				<View>
					<Text className="text-2xl font-bold text-foreground mb-2">
						Autenticação
					</Text>
					<Text className="text-muted-foreground mb-6">
						Entre com seu e-mail institucional para acessar a
						plataforma
					</Text>

					<Button
						className="relative mb-3"
						onPress={() => handleLogin("student")}
						variant={"inverted"}
						size={"lg"}
					>
						<GoogleIcon />
						<Text>Entrar como Aluno</Text>
					</Button>

					<Button
						className="relative"
						onPress={() => handleLogin("scholar")}
						variant={"outline"}
						size={"lg"}
					>
						<GoogleIcon />
						<Text>Entrar como Bolsista</Text>
					</Button>

					<Text className="text-center text-sm text-muted-foreground mt-8">
						Ao continuar, você concorda com nossos{"\n"}
						<Text
							onPress={() => openURL("https://example.com/terms")}
							className="underline text-sm text-muted-foreground hover:text-foreground"
						>
							Termos de Serviço
						</Text>{" "}
						e{" "}
						<Text
							onPress={() =>
								openURL("https://example.com/privacy")
							}
							className="underline text-sm text-muted-foreground hover:text-foreground"
						>
							Política de Privacidade
						</Text>
						.
					</Text>
				</View>
			</View>
		</View>
	);
}
