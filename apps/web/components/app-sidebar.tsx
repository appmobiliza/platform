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
	SidebarMenuButton,
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
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem className="flex items-start gap-2 flex-col p-4 border-b border-border">
						{/* <SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:p-1.5!"
						>
							<a href="#">
								<span className="text-base font-semibold">
									Mobiliza
								</span>
							</a>
						</SidebarMenuButton> */}
						<div className="flex flex-row items-center justify-between w-full">
							<Logo className="h-5 w-auto" />
							<SidebarTrigger />
						</div>
						<span className="text-sm font-norma text-muted-foreground">
							Painel NAC
						</span>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
