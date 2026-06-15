/**
 * Auth Callback — Página intermediária exclusiva da web.
 *
 * O OAuth do Google faz um redirect completo do navegador, destruindo o
 * contexto JS antes que o fluxo de pós-login em `auth.tsx` execute.
 * Esta página é o destino desse redirect (`/auth-callback`) e reproduz o
 * fluxo restante: buscar a sessão, cachear dados do usuário, verificar o
 * perfil no servidor e redirecionar para o destino correto.
 */

import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { authClient } from "@/lib/auth/client";
import {
	cacheUserInfo,
	clearUserCache,
	setHasProfile,
	setSimplifiedInterface,
} from "@/lib/auth/store";
import { trpc } from "@/lib/trpc/client";

import { toSessionUser } from "@/types/session";

/**
 * Hook que encapsula o fluxo de pós-login.
 *
 * Retorna um estado indicando se o processamento terminou e se houve erro.
 */
function usePostLogin() {
	const [status, setStatus] = useState<
		| { type: "loading" }
		| { type: "redirecting" }
		| { type: "error"; message: string }
	>({ type: "loading" });
	const trpcUtils = trpc.useUtils();

	// Garante que roda apenas uma vez, mesmo em Strict Mode
	const ran = useRef(false);

	useEffect(() => {
		if (ran.current) return;
		ran.current = true;

		(async () => {
			try {
				// 1. Limpa o cache para evitar que o layout reaja
				//    prematuramente enquanto processamos o login.
				clearUserCache();

				// 2. Busca a sessão recém-criada (o cookie já foi definido pelo
				//    servidor Better Auth durante o redirect do OAuth).
				const { data: sessionData, error: sessionError } =
					await authClient.getSession();

				if (sessionError || !sessionData?.user) {
					setStatus({
						type: "error",
						message:
							sessionError?.message ??
							"Não foi possível recuperar os dados da sessão.",
					});
					return;
				}

				const user = toSessionUser(
					sessionData.user as Record<string, unknown>,
				);

				if (!user) {
					setStatus({
						type: "error",
						message: "Dados do usuário não disponíveis.",
					});
					return;
				}

				setStatus({ type: "redirecting" });

				// 3. Scholar — loga direto (perfil gerenciado pelo gestor)
				if (user.role === "scholar") {
					cacheUserInfo({
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
						role: user.role,
					});
					setHasProfile(true);
					window.location.href = "/(tabs)";
					return;
				}

				// 4. Student — verifica com o servidor se o perfil existe.
				//     Só cacheia os dados DEPOIS da resposta para que o layout
				//     nunca veja userRole definido com hasProfile incorreto.
				let hasStudentProfile = false;
				let simplifiedInterface = false;
				try {
					const profileData = await trpcUtils.profiles.me.fetch();

					hasStudentProfile =
						"studentProfile" in profileData &&
						profileData.studentProfile != null;
					simplifiedInterface =
						hasStudentProfile &&
						(
							profileData.studentProfile as {
								simplifiedInterface?: boolean;
							} | null
						)?.simplifiedInterface === true;
				} catch {
					// Erro ao consultar perfil — assume que não existe
					hasStudentProfile = false;
					simplifiedInterface = false;
				}

				// Agora cacheia com os valores corretos
				cacheUserInfo({
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					role: user.role,
				});
				setHasProfile(hasStudentProfile);
				setSimplifiedInterface(simplifiedInterface);

				if (hasStudentProfile) {
					window.location.href = "/(tabs)";
					return;
				}

				// 5. Primeiro acesso — redireciona para o onboarding
				window.location.href = "/onboarding/unregistered";
			} catch (err) {
				console.error("Post-login callback error:", err);
				setStatus({
					type: "error",
					message: "Ocorreu um erro inesperado ao processar o login.",
				});
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trpcUtils]);

	return status;
}

export default function AuthCallback() {
	const status = usePostLogin();

	if (status.type === "error") {
		return (
			<View className="flex-1 items-center justify-center px-6 bg-background">
				<Text className="text-lg font-medium text-foreground mb-2">
					Erro ao autenticar
				</Text>
				<Text className="text-muted-foreground text-center mb-6">
					{status.message}
				</Text>
				<Text
					className="text-primary underline"
					onPress={() => {
						window.location.href = "/auth";
					}}
				>
					Tentar novamente
				</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 items-center justify-center bg-background">
			<ActivityIndicator size="large" />
			<Text className="text-muted-foreground mt-4">
				{status.type === "redirecting"
					? "Redirecionando..."
					: "Entrando..."}
			</Text>
		</View>
	);
}
