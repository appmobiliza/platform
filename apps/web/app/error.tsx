"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

import Logo from "@/assets/icons/logo";

interface Props {
	error: Error & { digest?: string };
}

function getErrorContent(error: Error) {
	const message = error.message.toLowerCase();
	const causeMessage =
		error.cause instanceof Error ? error.cause.message.toLowerCase() : "";
	const isNetworkFailure = [message, causeMessage].some((value) =>
		[
			"fetch failed",
			"failed to fetch",
			"networkerror",
			"econnrefused",
			"enotfound",
			"eai_again",
			"und_err_connect_timeout",
		].some((needle) => value.includes(needle)),
	);

	if (isNetworkFailure) {
		return {
			title: "Não foi possível conectar ao servidor",
			description:
				"Verifique se a API está executando e tente novamente em alguns instantes.",
		};
	}

	return {
		title: "Ops… algo deu errado em nossos bastidores.",
		description:
			"Estamos trabalhando nos ajustes — recarregue a página ou tente novamente em alguns instantes.",
	};
}

export default function ErrorPage({ error }: Props) {
	const { title, description } = getErrorContent(error);

	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<main className="flex min-h-svh w-full flex-col md:flex-row">
			<div className="flex w-full flex-col items-center justify-center gap-12 bg-primary p-12 text-primary-foreground md:w-1/2 max-md:h-[25vh]">
				<Logo className="h-9 md:h-12" />
			</div>
			<div className="flex flex-1 w-full flex-col items-center justify-center self-center p-12 md:w-1/2">
				<div className="flex w-full max-w-md flex-col items-center justify-center gap-6">
					<h1 className="text-2xl font-bold tracking-tight md:text-4xl text-center">
						{title}
					</h1>
					<p className="text-center text-muted-foreground">
						{description}
					</p>

					<span className="text-left text-sm bg-card p-3 rounded-md w-full">
						{error.message}
					</span>

					<Link href="/">
						<Button size={"lg"} className="p-6">
							Voltar para o início
						</Button>
					</Link>
				</div>
			</div>
		</main>
	);
}
