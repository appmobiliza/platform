"use client";

import {
	ChartNoAxesColumn,
	File,
	LayoutDashboard,
	Radio,
	Settings2,
	User,
	Users,
} from "lucide-react";
import type * as React from "react";

import Logo from "@/assets/icons/logo";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarTrigger,
} from "@/components/ui/sidebar";

const data = {
	navMain: [
		{
			title: "Visão Geral",
			url: "/",
			icon: LayoutDashboard,
		},
		{
			title: "Ao vivo",
			url: "/mapa",
			icon: Radio,
		},
		{
			title: "Atendimentos",
			url: "/atendimentos",
			icon: File,
		},
		{
			title: "Bolsistas",
			url: "/bolsistas",
			icon: Users,
		},
		{
			title: "Alunos",
			url: "/estudantes",
			icon: User,
		},
		{
			title: "Relatórios",
			url: "/relatorios",
			icon: ChartNoAxesColumn,
		},
		{
			title: "Configurações",
			url: "/configuracoes",
			icon: Settings2,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem className="flex flex-col items-start group-data-[collapsible=icon]:gap-0 pt-3.5 md:pt-2">
						<div className="flex w-full flex-row items-center justify-between transition-all duration-300 ease-in-out">
							<div className="w-36 shrink-0 overflow-hidden pl-4 transition-[width,opacity,padding] duration-300 ease-in-out group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:pl-0 group-data-[collapsible=icon]:opacity-0">
								<Logo className="h-5 w-31.5 max-w-none fill-foreground" />
							</div>
							<SidebarTrigger className="hidden md:flex" />
						</div>
						<span className="max-h-5 overflow-hidden text-sm font-normal text-muted-foreground transition-[max-height,opacity,transform,margin-top] duration-300 ease-in-out group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-mt-2 group-data-[collapsible=icon]:max-h-0 group-data-[collapsible=icon]:opacity-0 pl-4 mt-2">
							Painel NAC
						</span>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<div className="border-b border-border pt-3 text-sm font-medium" />
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
