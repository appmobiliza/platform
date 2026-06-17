import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GoogleIcon from "@/assets/google";
import { Logo } from "@/assets/logo";

import { NacContact } from "@/components/nac-contact";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";

import { authClient } from "@/lib/auth/client";
import {
	cacheUserInfo,
	clearUserCache,
	setHasProfile,
	setSimplifiedInterface,
} from "@/lib/auth/store";
import { trpc } from "@/lib/trpc/client";

import { hydrateRouteHistoryFromApi } from "@/stores/route-history-store";
import { toSessionUser } from "@/types/session";

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
						? `${process.env.EXPO_PUBLIC_APP_URL}/auth-callback`
						: "mobiliza://auth",
				errorCallbackURL:
					Platform.OS === "web"
						? `${process.env.EXPO_PUBLIC_APP_URL}/auth`
						: "mobiliza://auth",
			});

			if (error) {
				setIsLoading(false);
				toast.error("Erro de autenticação", {
					description:
						error.message ??
						"Não foi possível fazer login com Google.",
				});
				return;
			}

			console.log("auth", error);

			// ── Web: redirect handled by better-auth's redirectPlugin ─────
			// On web, signIn.social returns successfully after the server
			// responds with the OAuth URL. The redirectPlugin then sets
			// window.location.href to navigate the browser to Google, but
			// JS continues executing — the navigation is only scheduled.
			// We must return early here to prevent the code below (native-
			// only logic) from running before the redirect completes.
			if (Platform.OS === "web") {
				// The redirectPlugin has already set window.location.href.
				// No further action needed; the page will unload shortly.
				return;
			}

			// ── Native-only path ──────────────────────────────────────────
			// The same logic lives in auth-callback.tsx for the web flow.

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
				toast.error("Não foi possível recuperar os dados da sessão.");
				return;
			}

			const user = toSessionUser(
				sessionData.user as Record<string, unknown>,
			);

			if (!user) {
				setIsLoading(false);
				toast.error("Dados do usuário não disponíveis.");
				return;
			}

			console.log("Usuário encontrado", user);
			console.log("isScholar: ", user.role === "scholar");

			// Scholar — loga direto (perfil gerenciado pelo gestor)
			if (user.role === "scholar") {
				// Agora cacheia com os valores corretos
				cacheUserInfo({ ...user });

				setHasProfile(true);
				setIsLoading(false);
				router.replace("/(tabs)");
				return;
			}

			// Student — verifica com o servidor se o perfil existe.
			const profile = await trpcUtils.profiles.me.fetch();
			console.log("profile", profile);

			const hasStudentProfile =
				"studentProfile" in profile && profile.studentProfile !== null;
			const simplifiedInterface =
				hasStudentProfile &&
				(
					profile.studentProfile as {
						simplifiedInterface?: boolean;
					} | null
				)?.simplifiedInterface === true;

			console.log("hasStudentProfile: ", hasStudentProfile);

			// Hidrata o histórico de rotas antes de navegar para a home,
			// evitando um waterfall extra de requisição ao montar a tela inicial.
			if (hasStudentProfile) {
				try {
					const historyData =
						await trpcUtils.requests.studentHistory.fetchInfinite({
							limit: 50,
						});
					const allItems = historyData.pages.flatMap((p) => p.items);
					hydrateRouteHistoryFromApi(allItems);
				} catch {
					// Falha ao buscar histórico não impede o login;
					// o histórico será construído localmente com as viagens futuras.
				}
			}

			// Cacheia os dados do usuário e o estado do perfil, depois
			// redireciona explicitamente para o destino correto.
			cacheUserInfo({ ...user });

			setHasProfile(hasStudentProfile);
			setSimplifiedInterface(simplifiedInterface);
			setIsLoading(false);

			if (hasStudentProfile) {
				router.replace("/(tabs)");
				return;
			}

			router.replace("/onboarding/unregistered");
			return;
		} catch (err) {
			setIsLoading(false);
			console.log("Google login error:", err);
			toast.error("Erro de autenticação", {
				description:
					"Ocorreu um erro inesperado ao tentar fazer login.",
			});
		}
	};

	return (
		<View className="flex-1 bg-background">
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

					<NacContact
						className="items-center mt-8"
						helpTextClassName="text-foreground"
					/>
				</View>
			</View>
		</View>
	);
}
