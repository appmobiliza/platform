import { usePathname } from "expo-router";
import { TabList, TabSlot, Tabs, TabTrigger } from "expo-router/ui";
import { Home, Map as MapIcon, User } from "lucide-react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";
import { useUserRole } from "@/lib/auth-store";
import { View } from "react-native";

export default function AppTabs() {
	const pathname = usePathname();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const isHomeActive = pathname === "/";
	const isHistoryActive = pathname.startsWith("/history");
	const isProfileActive = pathname.startsWith("/profile");

	return (
		<Tabs className="flex h-screen min-h-0 flex-col bg-background overflow-y-scroll pb-24">
			<TabSlot className="flex-1 min-h-0 pb-20" />
			<TabList 
				className={cn(
					"fixed bottom-0 w-full z-50 flex-row items-center justify-around border-t px-2 py-2 pb-6 shadow-lg",
					isScholar ? "bg-[#1A1F1F] border-transparent" : "bg-background border-border/60"
				)}
			>
				<TabTrigger
					name="index"
					href="/"
					className="flex-1 flex-col items-center justify-center gap-1 py-1"
				>
					<View className={cn(
						"px-5 py-1 rounded-full",
						isHomeActive && isScholar ? "bg-[#0A2540]" : isHomeActive && !isScholar ? "bg-card" : "bg-transparent"
					)}>
						<Icon 
							icon={Home} 
							size={24} 
							color={isScholar ? "white" : isHomeActive ? "accent-foreground" : "muted-foreground"} 
						/>
					</View>
					<Text
						className={cn("text-xs font-bold", {
							"text-[#60A5FA]": isHomeActive && isScholar,
							"text-[#A3A3A3]": !isHomeActive && isScholar,
							"text-accent-foreground": isHomeActive && !isScholar,
							"text-muted-foreground": !isHomeActive && !isScholar,
						})}
					>
						Início
					</Text>
				</TabTrigger>
				
				<TabTrigger
					name="history"
					href="/history"
					className="flex-1 flex-col items-center justify-center gap-1 py-1"
				>
					<View className={cn(
						"px-5 py-1 rounded-full",
						isHistoryActive && isScholar ? "bg-[#0A2540]" : isHistoryActive && !isScholar ? "bg-card" : "bg-transparent"
					)}>
						<Icon 
							icon={MapIcon} 
							size={24} 
							color={isScholar ? "white" : isHistoryActive ? "accent-foreground" : "muted-foreground"} 
						/>
					</View>
					<Text
						className={cn("text-xs font-bold", {
							"text-[#60A5FA]": isHistoryActive && isScholar,
							"text-[#A3A3A3]": !isHistoryActive && isScholar,
							"text-accent-foreground": isHistoryActive && !isScholar,
							"text-muted-foreground": !isHistoryActive && !isScholar,
						})}
					>
						Histórico
					</Text>
				</TabTrigger>

				<TabTrigger
					name="profile"
					href="/profile"
					className="flex-1 flex-col items-center justify-center gap-1 py-1"
				>
					<View className={cn(
						"px-5 py-1 rounded-full",
						isProfileActive && isScholar ? "bg-[#0A2540]" : isProfileActive && !isScholar ? "bg-card" : "bg-transparent"
					)}>
						<Icon 
							icon={User} 
							size={24} 
							color={isScholar ? "white" : isProfileActive ? "accent-foreground" : "muted-foreground"} 
						/>
					</View>
					<Text
						className={cn("text-xs font-bold", {
							"text-[#60A5FA]": isProfileActive && isScholar,
							"text-[#A3A3A3]": !isProfileActive && isScholar,
							"text-accent-foreground": isProfileActive && !isScholar,
							"text-muted-foreground": !isProfileActive && !isScholar,
						})}
					>
						Perfil
					</Text>
				</TabTrigger>
			</TabList>
		</Tabs>
	);
}
