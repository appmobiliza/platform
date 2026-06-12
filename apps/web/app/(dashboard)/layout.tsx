import type { Metadata } from "next";

import { SessionRenewal } from "@/components/session-renewal";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import Logo from "@/assets/icons/logo";

export const metadata: Metadata = {
	title: "Dashboard do Mobiliza",
	description:
		"Acompanhe o desempenho dos atendimentos, visualize estatísticas e gerencie os serviços oferecidos pelo Mobiliza.",
	metadataBase: new URL("https://mobiliza.vercel.app"),
};

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<SessionRenewal />
			<SidebarProvider>
				<AppSidebar />
				<main className="flex min-w-0 flex-1 flex-col md:flex-row">
					{/* Header mobile */}
					<header className="border-b border-border p-4 flex flex-row items-center justify-between md:hidden w-full bg-card">
						<Logo className="h-5 w-32 max-w-none" />
						<SidebarTrigger />
					</header>
					{children}
				</main>
			</SidebarProvider>
		</>
	);
}
