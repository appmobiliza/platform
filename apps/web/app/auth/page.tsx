import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import google from "@/public/google.svg";
import logo from "@/public/logo.svg";

import { AuthErrorHandler } from "./auth-error-handler";
import { AuthGuard } from "./auth-guard";
import { GoogleSignInButton } from "./google-sign-in-button";

export const metadata: Metadata = {
	title: "Autenticação",
};

export default async function AuthPage() {
	return (
		<AuthGuard>
			<main className="flex min-h-svh w-full flex-col md:flex-row">
				<div className="flex w-full flex-col items-center justify-center gap-12 bg-primary p-12 text-primary-foreground md:w-1/2 md:items-start md:justify-between max-md:h-[40vh]">
					<Image src={logo} alt="Logo" className="h-4.5 md:h-6" />

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
						<Suspense fallback={null}>
							<AuthErrorHandler />
						</Suspense>
						<div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
							<p className="text-2xl font-bold">Autenticação</p>
							<p className="text-sm font-normal text-muted-foreground lg:px-12">
								Entre com seu e-mail institucional para acessar
								a plataforma
							</p>
						</div>
						<Suspense fallback={null}>
							<GoogleSignInButton googleLogo={google} />
						</Suspense>
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
					</div>
				</div>
			</main>
		</AuthGuard>
	);
}
