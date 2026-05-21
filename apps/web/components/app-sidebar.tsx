"use client";

import type * as React from "react";

import {
	ChartNoAxesColumn,
	File,
	LayoutDashboard,
	Settings2,
	User,
	Users,
} from "lucide-react";

import Logo from "@/components/logo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
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
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Visão Geral",
			url: "#",
			icon: LayoutDashboard,
		},
		{
			title: "Atendimentos",
			url: "#",
			icon: File,
		},
		{
			title: "Bolsistas",
			url: "#",
			icon: Users,
		},
		{
			title: "Alunos",
			url: "#",
			icon: User,
		},
		{
			title: "Relatórios",
			url: "#",
			icon: ChartNoAxesColumn,
		},
		{
			title: "Configurações",
			url: "#",
			icon: Settings2,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem className="flex flex-col items-start gap-2 group-data-[collapsible=icon]:gap-0 pt-2">
						<div className="flex w-full flex-row items-center justify-between gap-2 group-data-[collapsible=icon]:w-fit group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:gap-0">
							<div className="w-31.5 shrink-0 overflow-hidden transition-[width,opacity] duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
								<Logo className="h-5 w-31.5 max-w-none pl-4" />
							</div>
							<SidebarTrigger />
						</div>
						<span className="max-h-5 overflow-hidden text-sm font-normal text-muted-foreground transition-[max-height,opacity,transform,margin-top] duration-200 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-mt-2 group-data-[collapsible=icon]:max-h-0 group-data-[collapsible=icon]:opacity-0 pl-4">
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
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
