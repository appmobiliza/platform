import Link from "next/link";

import { Button } from "@/components/ui/button";

import Logo from "@/assets/icons/logo";

export default function NotFound() {
	return (
		<main className="flex min-h-svh w-full flex-col md:flex-row">
			<div className="flex w-full flex-col items-center justify-center gap-12 bg-primary p-12 text-primary-foreground md:w-1/2 max-md:h-[25vh]">
				<Logo className="h-9 md:h-12" />
			</div>
			<div className="flex flex-1 w-full flex-col items-center justify-center self-center p-12 md:w-1/2">
				<div className="flex w-full max-w-md flex-col items-center justify-center gap-6">
					<h1 className="text-4xl font-bold tracking-tight md:text-6xl">
						404
					</h1>
					<h2 className="text-center font-semibold text-4xl text-muted-foreground">
						Infelizmente não encontramos a página que você estava
						procurando.
					</h2>

					<Link href="/">
						<Button size={"lg"} className="px-4 py-6">
							Voltar para o início
						</Button>
					</Link>
				</div>
			</div>
		</main>
	);
}
