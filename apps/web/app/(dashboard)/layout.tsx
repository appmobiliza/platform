import type { Metadata } from "next";

import { AppSidebar } from "@/components/app-sidebar";
import Logo from "@/components/temp-icons/logo";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
	title: "Dashboard do Mobiliza",
	description:
		"Acompanhe o desempenho dos atendimentos, visualize estatísticas e gerencie os serviços oferecidos pelo Mobiliza.",
	metadataBase: new URL("https://mobiliza.vercel.app"),
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="flex-1 min-w-0 flex flex-col">
				{/* Header mobile */}
				<header className="border-b border-border p-4 flex flex-row items-center justify-between md:hidden w-full bg-card">
					<Logo className="h-5 w-32 max-w-none" />
					<SidebarTrigger />
				</header>
				{children}
			</main>
		</SidebarProvider>
	);
}
