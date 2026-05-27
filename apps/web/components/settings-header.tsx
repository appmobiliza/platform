"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Save } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./ui/button";

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

	// Mark the active route
	const activeRoute = routes.find((route) => route.url === pathname);

	return (
		<header className="border-b border-border bg-card overflow-x-auto no-scrollbar">
			<div className="flex flex-row items-center justify-start w-full pl-4 md:pl-6 last:mr-4 md:last:mr-6">
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
					>
						{route.title}
					</Link>
				))}
			</div>
		</header>
	);
}
