import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { authClient } from "@/lib/auth-client";
import { cacheUserInfo, clearUserCache, setHasProfile } from "@/lib/auth-store";
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
						: "mobiliza://auth",
				errorCallbackURL:
					Platform.OS === "web"
						? `${process.env.EXPO_PUBLIC_WEB_URL}/auth`
						: "mobiliza://auth",
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

			// Limpa o cache de auth para evitar que o layout reaja
			// prematuramente quando o useSession() resolver — enquanto
			// userRole estiver ausente do cache, useIsLoggedIn() retorna
			// false mesmo com sessão válida. O cache será restaurado
			// abaixo com os valores corretos APÓS a verificação no servidor.
			clearUserCache();

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

			console.log("Usuário encontrado", user.id);

			// Agora cacheia com os valores corretos
			cacheUserInfo({
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				role: user.role,
			});

			console.log("isScholar: ", user.role === "scholar");

			// Scholar — loga direto (perfil gerenciado pelo gestor)
			if (user.role === "scholar") {
				setHasProfile(true);
				setIsLoading(false);
				router.replace("/(tabs)");
				return;
			}

			// Student — verifica com o servidor se o perfil existe.
			// Só cacheia os dados DEPOIS da resposta para que o layout
			// nunca veja um estado intermediário com userRole definido
			// mas hasProfile incorreto.
			const profile = await trpcUtils.profiles.me.fetch();
			console.log("studentProfile: ", profile);
			const hasStudentProfile =
				"studentProfile" in profile && profile.studentProfile !== null;

			setHasProfile(hasStudentProfile);

			if (hasStudentProfile) {
				console.log("Usuário possui perfil", user.id);
				// router.replace("/(tabs)");
			} else {
				console.log("Usuário não possui perfil", user.id);
				// router.replace("/onboarding/unregistered");
			}
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
