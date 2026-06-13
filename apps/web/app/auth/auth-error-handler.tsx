"use client";

import { AlertCircle, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Mapa de códigos de erro do Better Auth para mensagens amigáveis.
 */
const errorMessages: Record<string, string> = {
	access_denied:
		"Você cancelou a autenticação com o Google. Tente novamente quando quiser.",
	oauth_provider_not_found:
		"Provedor de autenticação não encontrado. Entre em contato com o suporte.",
	email_not_found:
		"Não foi possível obter seu e-mail do Google. Verifique as permissões do Google.",
	account_already_linked_to_different_user:
		"Esta conta Google já está vinculada a outro usuário.",
	invalid_callback_request:
		"A solicitação de autenticação é inválida. Tente novamente.",
	state_mismatch: "Erro de segurança na autenticação. Tente novamente.",
	internal_server_error:
		"Ocorreu um erro interno ao autenticar. Tente novamente mais tarde.",
	unauthorized_role:
		"Seu e-mail não possui permissão de acesso ao painel de gestão. Entre em contato com o administrador.",
};

function getErrorMessage(code: string): string {
	return (
		errorMessages[code] ||
		`Ocorreu um erro durante a autenticação (${code}). Tente novamente.`
	);
}

export function AuthErrorHandler() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");

	const dismiss = useCallback(() => {
		const url = new URL(window.location.href);
		url.searchParams.delete("error");
		window.history.replaceState({}, "", url.toString());
	}, []);

	if (!error) {
		return null;
	}

	return (
		<Alert variant="destructive" className="mb-6 pr-10 relative">
			<AlertCircle className="size-4" />
			<AlertTitle>Erro na autenticação</AlertTitle>
			<AlertDescription>{getErrorMessage(error)}</AlertDescription>
			<Button
				variant="ghost"
				size="icon-xs"
				className="absolute top-2 right-2"
				onClick={dismiss}
			>
				<X className="size-3" />
			</Button>
		</Alert>
	);
}
