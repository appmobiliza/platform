"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth/client";
import type { WebSessionUser } from "@/lib/auth/web-session";

/**
 * Renova proativamente o cookie de sessão assinado antes que expire.
 *
 * A cada 10 minutos (antes dos 15 min de TTL do cookie), consulta a
 * sessão via Better Auth (que tem o cookie no domínio da API) e, se
 * válida, recria o cookie assinado do Next.js.
 *
 * Isso evita que o middleware redirecione para /auth durante o uso
 * ativo do dashboard.
 *
 * Coloque este componente uma vez no layout do dashboard.
 */
export function SessionRenewal() {
	useEffect(() => {
		async function renew() {
			try {
				const { data } = await authClient.getSession();
				if (data?.user) {
					const user = data.user as unknown as WebSessionUser;
					if (user.id && user.role) {
						await fetch("/api/auth/create-session", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								userId: user.id,
								role: user.role,
							}),
						});
					}
				}
			} catch {
				// Se a renovação falhar (ex: sessão expirou), o middleware
				// redirecionará para /auth na próxima navegação
			}
		}

		// Renova a cada 10 minutos (antes dos 15 min de expiração)
		const interval = setInterval(renew, 10 * 60 * 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	// Componente invisível — apenas efeito colateral
	return null;
}
