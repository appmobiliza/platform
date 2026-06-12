"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";

export function useLogout() {
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	async function handleLogout() {
		setIsLoggingOut(true);
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: async () => {
						// Limpa o cookie de sessão assinado do Next.js
						await fetch("/api/auth/clear-session", {
							method: "POST",
						});
						router.push("/auth");
					},
				},
			});
		} catch {
			toast.error("Erro ao sair. Tente novamente.");
			setIsLoggingOut(false);
		}
	}

	return { handleLogout, isLoggingOut };
}
