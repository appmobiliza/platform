import { usePathname } from "expo-router";
import { TabList, TabSlot, Tabs, TabTrigger } from "expo-router/ui";
import { Home, Map as MapIcon, User } from "lucide-react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

export default function AppTabs() {
	const pathname = usePathname();

	const isHomeActive = pathname === "/";
	const isHistoryActive = pathname.startsWith("/history");
	const isProfileActive = pathname.startsWith("/profile");

	return (
		<Tabs className="flex h-screen min-h-0 flex-col bg-background overflow-y-scroll">
			<TabSlot className="flex-1 min-h-0 pb-28" />
			<TabList className="fixed bottom-4 left-1/2 z-50 max-w-md -translate-x-1/2 flex-row items-center rounded-full border border-border/60 bg-background/95 px-2 py-2 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80">
				<TabTrigger
					name="index"
					href="/"
					className={cn(
						"flex-1 flex-col items-center justify-center gap-0 rounded-full px-8 py-2 text-muted-foreground",
						isHomeActive && "bg-card text-accent-foreground",
					)}
				>
					<Icon icon={Home} size={24} />
					<Text
						className={cn("text-sm", {
							"text-accent-foreground": isHomeActive,
						})}
					>
						Início
					</Text>
				</TabTrigger>
				<TabTrigger
					name="history"
					href="/history"
					className={cn(
						"flex-1 flex-col items-center justify-center gap-0 rounded-full px-8 py-2 text-muted-foreground",
						isHistoryActive && "bg-card text-accent-foreground",
					)}
				>
					<Icon icon={MapIcon} size={24} />
					<Text
						className={cn("text-sm", {
							"text-accent-foreground": isHistoryActive,
						})}
					>
						Histórico
					</Text>
				</TabTrigger>
				<TabTrigger
					name="profile"
					href="/profile"
					className={cn(
						"flex-1 flex-col items-center justify-center gap-0 rounded-full px-8 py-2 text-muted-foreground",
						isProfileActive && "bg-card text-accent-foreground",
					)}
				>
					<Icon icon={User} size={24} />
					<Text
						className={cn("text-sm", {
							"text-accent-foreground": isProfileActive,
						})}
					>
						Perfil
					</Text>
				</TabTrigger>
			</TabList>
		</Tabs>
	);
}
