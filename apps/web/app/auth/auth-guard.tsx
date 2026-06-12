"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";
import type { WebSessionUser } from "@/lib/auth/web-session";

/**
 * Gerencia a criação do cookie assinado após o login ou renovação.
 *
 * Cenários:
 * - `?redirect=<path>` → usuário foi redirecionado pelo middleware
 *   porque o cookie expirou ou não existe. Tenta obter a sessão
 *   via Better Auth (que tem o cookie no domínio da API).
 *   Se conseguir e o papel for "manager", cria o cookie assinado
 *   e redireciona para <path>.
 *
 * - `?login=success&redirect=<path>` → usuário acabou de fazer login
 *   via OAuth. Mesmo fluxo acima.
 *
 * - Sem parâmetros → apenas exibe o conteúdo da página de auth.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isChecking, setIsChecking] = useState(true);

	const redirectTo = searchParams.get("redirect");
	const shouldCheck = redirectTo !== null || searchParams.has("login");

	useEffect(() => {
		if (!shouldCheck) {
			setIsChecking(false);
			return;
		}

		let cancelled = false;

		async function checkSession() {
			try {
				const { data } = await authClient.getSession();

				if (cancelled) return;

				if (data?.user) {
					// O campo `role` é um additional field do Better Auth
					const user = data.user as unknown as WebSessionUser;

					if (!user.id || !user.role) {
						return;
					}

					// Só cria o cookie se o papel for manager
					if (user.role !== "manager") {
						const url = new URL(window.location.href);
						url.searchParams.set("error", "unauthorized_role");
						window.history.replaceState({}, "", url.toString());
						toast.error(
							"Seu e-mail não possui permissão de acesso ao painel de gestão.",
						);
						return;
					}

					// Cria o cookie assinado no servidor
					const res = await fetch("/api/auth/create-session", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							userId: user.id,
							role: user.role,
						}),
					});

					if (res.ok && redirectTo) {
						router.replace(redirectTo);
					} else if (res.ok) {
						router.replace("/");
					}
				}
				// Se não tem sessão, apenas mostra a página de login
			} catch {
				// Sessão não disponível (não autenticado)
			} finally {
				if (!cancelled) setIsChecking(false);
			}
		}

		checkSession();

		return () => {
			cancelled = true;
		};
	}, [shouldCheck, redirectTo, router]);

	// Enquanto verifica a sessão, mostra um estado neutro
	if (isChecking && shouldCheck) {
		return (
			<div className="flex min-h-svh items-center justify-center">
				<div className="text-sm text-muted-foreground">
					Verificando autenticação…
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
