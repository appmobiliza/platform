"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: ComponentType<SVGProps<SVGSVGElement>>;
	}[];
}) {
	const pathname = usePathname();

	// Precisamos incluir subrotas para marcar o item como ativo, por exemplo, "/configuracoes" deve ser ativo para "/configuracoes/locais"
	const isActive = (url: string) => {
		if (url === "/") {
			return pathname === url;
		}
		return pathname === url || pathname.startsWith(`${url}/`);
	};

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								size={"lg"}
								isActive={isActive(item.url)}
								tooltip={item.title}
							>
								<Link href={item.url}>
									{item.icon && <item.icon />}
									{item.title}
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
