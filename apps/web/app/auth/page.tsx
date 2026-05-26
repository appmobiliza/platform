import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import google from "@/public/google.svg";
import logo from "@/public/logo.svg";

export default function AuthPage() {
	return (
		<main className="flex flex-col md:flex-row w-full min-h-svh">
			<div className="flex flex-col w-full md:w-1/2 items-center md:items-start justify-center gap-12 md:justify-between max-md:h-[40vh] p-12 bg-primary">
				<Image
					src={logo}
					alt="Logo"
					className="text-white h-4.5 md:h-6"
				/>

				<div className="flex flex-col items-center md:items-start gap-2 text-white">
					<p className="text-3xl md:text-4xl font-bold">
						Painel de Gestão
					</p>
					<p className="text-base md:text-lg font-normal">
						Núcleo de Acessibilidade
					</p>
				</div>
			</div>
			<div className="flex flex-col w-full md:w-1/2 items-center self-center justify-center flex-1 p-12">
				<div className="sm:max-w-sm flex flex-col w-full items-center justify-center gap-6">
					<div className="flex flex-col w-full h-full items-center justify-center gap-2">
						<p className="text-2xl font-bold">Autenticação</p>
						<p className="text-sm font-normal text-center text-muted-foreground lg:px-12">
							Entre com seu e-mail institucional para acessar a
							plataforma
						</p>
					</div>
					<Link href="/dashboard" className="w-full">
						<Button
							variant="secondary"
							className="w-full"
							size={"lg"}
						>
							<Image src={google} alt="Google" className="mr-2" />
							Continuar com o Google
						</Button>
					</Link>
					<span className="text-xs text-center text-muted-foreground lg:px-12">
						Ao continuar, você concorda com nossos{" "}
						<a
							href="https://example.com/terms"
							target="__blank"
							className="underline hover:text-foreground transition-colors duration-200"
						>
							Termos de Serviço
						</a>{" "}
						e{" "}
						<a
							href="https://example.com/privacy"
							target="__blank"
							className="underline hover:text-foreground transition-colors duration-200"
						>
							Política de Privacidade
						</a>
					</span>
				</div>
			</div>
		</main>
	);
}
