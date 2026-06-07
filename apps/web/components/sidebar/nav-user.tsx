"use client";

import {
	BellIcon,
	EllipsisVertical,
	Loader2,
	LogOut,
	UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

import { useLogout } from "@/hooks/use-logout";
import { authClient } from "@/lib/auth/client";

export function NavUser() {
	const { data: session, isPending } = authClient.useSession();
	const { isMobile } = useSidebar();
	const router = useRouter();
	const { handleLogout, isLoggingOut } = useLogout();

	const user = session?.user;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:p-0!"
						>
							{isPending ? (
								<div className="flex items-center gap-2 py-1">
									<Loader2 className="size-4 animate-spin" />
								</div>
							) : user ? (
								<>
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={user.image ?? undefined}
											alt={user.name ?? "Usuário"}
										/>
										<AvatarFallback className="rounded-lg">
											{user.name
												?.split(" ")
												.map((n) => n[0])
												.join("") ?? "??"}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">
											{user.name}
										</span>
										<span className="truncate text-xs text-muted-foreground">
											{user.email}
										</span>
									</div>
								</>
							) : (
								<div className="flex items-center gap-2 py-1">
									<UserCircle className="size-4" />
									<span className="text-xs text-muted-foreground">
										Desconectado
									</span>
								</div>
							)}
							<EllipsisVertical className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						{user ? (
							<>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
										<Avatar className="h-8 w-8 rounded-lg">
											<AvatarImage
												src={user.image ?? undefined}
												alt={user.name ?? "Usuário"}
											/>
											<AvatarFallback className="rounded-lg">
												{user.name
													?.split(" ")
													.map((n) => n[0])
													.join("") ?? "??"}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-medium">
												{user.name}
											</span>
											<span className="truncate text-xs text-muted-foreground">
												{user.email}
											</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem asChild>
										<Link href={`/configuracoes/conta`}>
											<UserCircle />
											Conta
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem disabled>
										<BellIcon />
										Notificações
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									disabled={isLoggingOut}
								>
									{isLoggingOut ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<LogOut />
									)}
									Sair
								</DropdownMenuItem>
							</>
						) : (
							<DropdownMenuItem
								onClick={() => router.push("/auth")}
							>
								<UserCircle />
								Entrar
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
