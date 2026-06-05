"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

const routes = [
	{
		title: "Geral",
		url: "/configuracoes",
	},
	{
		title: "Locais do campus",
		url: "/configuracoes/locais",
	},
	{
		title: "Notificações",
		url: "/configuracoes/notificacoes",
		disabled: true,
	},
	{
		title: "Conta",
		url: "/configuracoes/conta",
	},
];

export function SettingsHeader() {
	return (
		<header className="flex flex-col md:flex-row items-start justify-start gap-4 md:items-center md:justify-between border-b border-border bg-card p-4 md:p-6">
			<div className="flex flex-col gap-1">
				<h1 className="text-base font-semibold">Configurações</h1>
				<h2 className="text-sm text-muted-foreground">
					Campus A.C. Simões · Mobiliza v0.1
				</h2>
			</div>
			<div className="items-center gap-4 w-full md:w-auto hidden md:flex">
				<Button
					size={"lg"}
					className="gap-2 px-3 w-full md:w-auto"
					type="submit"
					disabled
				>
					<Save className="size-4" />
					Salvar alterações
				</Button>
			</div>
		</header>
	);
}

export function SettingsSubHeader() {
	const pathname = usePathname();
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const activeButtonRef = useRef<HTMLAnchorElement>(null);

	useEffect(() => {
		if (!pathname) {
			return;
		}

		if (scrollContainerRef.current && activeButtonRef.current) {
			const container = scrollContainerRef.current;
			const activeButton = activeButtonRef.current;

			// Calcula a posição para centralizar o botão ativo
			const scrollTo =
				activeButton.offsetLeft -
				(container.clientWidth - activeButton.clientWidth) / 2;

			container.scrollTo({
				left: scrollTo,
				behavior: "smooth",
			});
		}
	}, [pathname]);

	// Mark the active route
	const activeRoute = routes.find((route) => route.url === pathname);

	return (
		<header
			className="border-b border-border flex-row flex bg-card overflow-x-auto no-scrollbar"
			ref={scrollContainerRef}
		>
			<div className="flex flex-row items-center justify-start px-4 md:px-6 ">
				{routes.map((route) => (
					<Link
						key={route.url}
						href={route.url}
						aria-disabled={route.disabled}
						className={cn(
							"text-sm font-medium text-muted-foreground hover:text-foreground px-4 md:px-6 py-4 border-primary whitespace-nowrap shrink-0",
							route.disabled &&
								"cursor-not-allowed opacity-50 pointer-events-none select-none",
							activeRoute?.url === route.url &&
								"text-foreground border-b-2",
						)}
						ref={
							activeRoute?.url === route.url
								? activeButtonRef
								: null
						}
					>
						{route.title}
					</Link>
				))}
			</div>
		</header>
	);
}
