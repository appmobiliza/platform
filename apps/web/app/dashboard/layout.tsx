import { AppSidebar } from "@/components/app-sidebar";
import Logo from "@/components/logo";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="flex-1 flex flex-col">
				<header className="border-b border-border p-4 flex flex-row items-center justify-between md:hidden w-full bg-card">
					<Logo className="h-5 w-32 max-w-none" />
					<SidebarTrigger />
				</header>
				{children}
			</main>
		</SidebarProvider>
	);
}
