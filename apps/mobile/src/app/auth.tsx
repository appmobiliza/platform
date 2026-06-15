import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import GoogleIcon from "@/assets/google";
import { Logo } from "@/assets/logo";

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
						? `${process.env.EXPO_PUBLIC_APP_URL}/auth-callback`
						: "mobiliza://auth",
				errorCallbackURL:
					Platform.OS === "web"
						? `${process.env.EXPO_PUBLIC_APP_URL}/auth`
						: "mobiliza://auth",
			});

			if (error) {
				setIsLoading(false);
				toast.error(
					error.message ?? "Não foi possível fazer login com Google.",
					{ description: "Erro de autenticação" },
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

			console.log("Usuário encontrado", user.id);
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
			// Só cacheia os dados DEPOIS da resposta para que o layout
			// nunca veja um estado intermediário com userRole definido
			// mas hasProfile incorreto.
			const profile = await trpcUtils.profiles.me.fetch();
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

			setHasProfile(hasStudentProfile);
			setSimplifiedInterface(simplifiedInterface);

			// Agora cacheia com os valores corretos
			cacheUserInfo({ ...user });
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

					<View className="items-center mt-8">
						<Text className="text-sm text-foreground">
							Precisando de ajuda?
						</Text>
						<Pressable
							className="mt-1"
							onPress={() => {
								toast.info("Entre em contato com o NAC", {
									closeButton: true,
									description: (
										<View className="gap-3">
											<Pressable
												onPress={() =>
													openURL(
														"mailto:atendimentonac.ufal@gmail.com",
													)
												}
												className="active:opacity-70"
											>
												<Text className="text-muted-foreground text-sm">
													E-mail:{" "}
												</Text>
												<Text className="text-info text-sm underline">
													atendimentonac.ufal@gmail.com
												</Text>
											</Pressable>
											<View>
												<Text className="text-muted-foreground text-sm">
													Telefones:
												</Text>
												<View className="flex-row flex-wrap items-center">
													<Pressable
														onPress={() =>
															openURL(
																"tel:8232141080",
															)
														}
														className="active:opacity-70"
													>
														<Text className="text-info text-sm underline">
															82 3214-1080
														</Text>
													</Pressable>
													<Text className="text-muted-foreground text-sm">
														{" "}
														/{" "}
													</Text>
													<Pressable
														onPress={() =>
															openURL(
																"tel:8232141081",
															)
														}
														className="active:opacity-70"
													>
														<Text className="text-info text-sm underline">
															3214-1081
														</Text>
													</Pressable>
													<Text className="text-muted-foreground text-sm">
														{" "}
														/{" "}
													</Text>
													<Pressable
														onPress={() =>
															openURL(
																"tel:8232141079",
															)
														}
														className="active:opacity-70"
													>
														<Text className="text-info text-sm underline">
															3214-1079
														</Text>
													</Pressable>
												</View>
											</View>
											<Pressable
												onPress={() =>
													openURL(
														"https://instagram.com/proestufal",
													)
												}
												className="active:opacity-70"
											>
												<Text className="text-muted-foreground text-sm">
													Instagram:{" "}
												</Text>
												<Text className="text-info text-sm underline">
													@proestufal
												</Text>
											</Pressable>
										</View>
									),
								});
							}}
						>
							<Text className="text-sm text-muted-foreground active:underline font-medium">
								Entre em contato com o NAC
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</View>
	);
}
