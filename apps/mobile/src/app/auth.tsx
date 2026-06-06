import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { authClient } from "@/lib/auth-client";
import { cacheUserInfo, setHasProfile } from "@/lib/auth-store";
import { trpc } from "@/lib/trpc/client";

import GoogleIcon from "@/assets/google";
import { Logo } from "@/assets/logo";
import { toSessionUser } from "@/types/session";

const openURL = (url: string) => {
	Linking.openURL(url).catch((err) => {
		console.error("Failed to open URL:", err);
	});
};

export default function Auth() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const trpcUtils = trpc.useUtils();

	const handleGoogleLogin = async () => {
		setIsLoading(true);

		try {
			const { error } = await authClient.signIn.social({
				provider: "google",
				callbackURL:
					Platform.OS === "web"
						? `${process.env.EXPO_PUBLIC_WEB_URL}/auth-callback`
						: "/auth",
				errorCallbackURL:
					Platform.OS === "web"
						? `${process.env.EXPO_PUBLIC_WEB_URL}/auth`
						: "/auth",
			});

			if (error) {
				setIsLoading(false);
				Alert.alert(
					"Erro de autenticação",
					error.message ?? "Não foi possível fazer login com Google.",
				);
				return;
			}

			// ── Native-only path ──────────────────────────────────────────
			// On web the code below never runs because signIn.social triggers
			// a full browser redirect. The same logic lives in auth-callback.tsx.

			// Busca a sessão recém-criada
			const { data: sessionData } = await authClient.getSession();

			if (!sessionData?.user) {
				setIsLoading(false);
				Alert.alert(
					"Erro",
					"Não foi possível recuperar os dados da sessão.",
				);
				return;
			}

			const user = toSessionUser(
				sessionData.user as Record<string, unknown>,
			);

			if (!user) {
				setIsLoading(false);
				Alert.alert("Erro", "Dados do usuário não disponíveis.");
				return;
			}

			// Cacheia dados básicos do usuário em MMKV
			cacheUserInfo({
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				role: user.role,
			});

			console.log("user", user);

			// Scholar — loga direto (perfil gerenciado pelo gestor)
			if (user.role === "scholar") {
				setHasProfile(true);
				setIsLoading(false);
				router.replace("/(tabs)");
				return;
			}

			// Student — limpa cache local e verifica com o servidor
			// para evitar redirecionamento incorreto com dado desatualizado
			setHasProfile(false);

			// Verifica no servidor se o perfil de estudante existe
			try {
				const profileData = await trpcUtils.profiles.me.fetch();

				const hasStudentProfile =
					"studentProfile" in profileData &&
					profileData.studentProfile != null;

				setHasProfile(hasStudentProfile);

				if (hasStudentProfile) {
					setIsLoading(false);
					router.replace("/(tabs)");
					return;
				}
			} catch {
				// Erro ao consultar perfil — assume que não existe (primeiro acesso)
				setHasProfile(false);
			}

			// Primeiro acesso — redireciona para o onboarding
			setIsLoading(false);
			router.replace("/onboarding/unregistered");
		} catch (err) {
			setIsLoading(false);
			console.error("Google login error:", err);
			Alert.alert(
				"Erro de autenticação",
				"Ocorreu um erro inesperado ao tentar fazer login.",
			);
		}
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
						onPress={handleGoogleLogin}
						variant="inverted"
						size="lg"
						disabled={isLoading}
					>
						<GoogleIcon />
						<Text>
							{isLoading ? "Entrando..." : "Entrar com Google"}
						</Text>
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
