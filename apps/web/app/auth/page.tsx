"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import google from "@/public/google.svg";
import logo from "@/public/logo.svg";

import { authClient } from "@/lib/auth-client";

export default function AuthPage() {
	const { data: session, isPending } = authClient.useSession();
	const [isSigningIn, setIsSigningIn] = useState(false);
	const isBusy = isPending || isSigningIn;

	async function handleGoogleSignIn() {
		setIsSigningIn(true);

		try {
			await authClient.signIn.social({
				provider: "google",
			});
		} finally {
			setIsSigningIn(false);
		}
	}

	return (
		<main className="flex min-h-svh w-full flex-col md:flex-row">
			<div className="flex w-full flex-col items-center justify-center gap-12 bg-primary p-12 text-primary-foreground md:w-1/2 md:items-start md:justify-between max-md:h-[40vh]">
				<Image
					src={logo}
					alt="Logo"
					className="h-4.5 md:h-6"
				/>

				<div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
					<p className="text-3xl font-bold md:text-4xl">
						Painel de Gestão
					</p>
					<p className="text-base font-normal md:text-lg">
						Núcleo de Acessibilidade
					</p>
				</div>
			</div>
			<div className="flex flex-1 w-full flex-col items-center justify-center self-center p-12 md:w-1/2">
				<div className="flex w-full max-w-sm flex-col items-center justify-center gap-6">
					<div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
						<p className="text-2xl font-bold">Autenticação</p>
						<p className="text-sm font-normal text-muted-foreground lg:px-12">
							Entre com seu e-mail institucional para acessar a
							plataforma
						</p>
					</div>
					{session ? (
						<Link href="/dashboard" className="w-full">
							<Button variant="secondary" className="w-full" size="lg">
								Continuar para o painel
							</Button>
						</Link>
					) : (
						<Button
							variant="secondary"
							className="w-full"
							size="lg"
							onClick={handleGoogleSignIn}
							disabled={isBusy}
						>
							{isBusy ? (
								<Loader2 className="mr-2 size-4 animate-spin" />
							) : (
								<Image src={google} alt="Google" className="mr-2" />
							)}
							Entrar com o Google
						</Button>
					)}
					<span className="text-center text-xs text-muted-foreground lg:px-12">
						Ao continuar, você concorda com nossos{" "}
						<a
							href="https://example.com/terms"
							target="_blank"
							rel="noreferrer"
							className="underline transition-colors duration-200 hover:text-foreground"
						>
							Termos de Serviço
						</a>{" "}
						e{" "}
						<a
							href="https://example.com/privacy"
							target="_blank"
							rel="noreferrer"
							className="underline transition-colors duration-200 hover:text-foreground"
						>
							Política de Privacidade
						</a>
					</span>
					{session ? (
						<p className="text-xs text-muted-foreground">
							Conectado como {session.user.name}.
						</p>
					) : null}
				</div>
			</div>
		</main>
	);
}
