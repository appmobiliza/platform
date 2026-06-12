"use client";

import { webBaseUrl } from "@mobiliza/env/base-url";

import { Loader2 } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth/client";

type GoogleSignInButtonProps = {
	googleLogo: StaticImageData;
};

export function GoogleSignInButton({ googleLogo }: GoogleSignInButtonProps) {
	const [isSigningIn, setIsSigningIn] = useState(false);
	const searchParams = useSearchParams();

	// Preserva o path original que o usuário tentava acessar
	const redirectTo = searchParams.get("redirect") || "/";

	async function handleGoogleSignIn() {
		setIsSigningIn(true);

		try {
			await authClient.signIn.social({
				provider: "google",
				callbackURL: `${webBaseUrl}/auth?login=success&redirect=${encodeURIComponent(redirectTo)}`,
				errorCallbackURL: `${webBaseUrl}/auth`,
			});
		} catch (error) {
			console.error("Erro ao fazer login com Google:", error);
			toast.error(
				"Ocorreu um erro ao tentar entrar com o Google. Por favor, tente novamente.",
			);
			setIsSigningIn(false);
		}
	}

	return (
		<Button
			variant="secondary"
			className="w-full"
			size="lg"
			onClick={handleGoogleSignIn}
			disabled={isSigningIn}
		>
			{isSigningIn ? (
				<Loader2 className="mr-2 size-4 animate-spin" />
			) : (
				<Image src={googleLogo} alt="Google" className="mr-2" />
			)}
			Entrar com o Google
		</Button>
	);
}
