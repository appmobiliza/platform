import { usePathname } from "expo-router";
import { TabList, TabSlot, Tabs, TabTrigger } from "expo-router/ui";
import { Home, Map as MapIcon, User } from "lucide-react-native";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useUserRole } from "@/lib/auth/store";
import { SCHOLAR_THEME, THEME } from "@/lib/theme";
import { useAppColorScheme } from "@/lib/theme/use-app-color-scheme";
import { cn } from "@/lib/utils";

function DefaultAppTabs() {
	const pathname = usePathname();
	const colorScheme = useAppColorScheme();
	const role = useUserRole();
	const isScholar = role === "scholar";
	const theme = isScholar ? SCHOLAR_THEME[colorScheme] : THEME[colorScheme];

	const isHomeActive = pathname === "/";
	const isHistoryActive = pathname.startsWith("/history");
	const isProfileActive = pathname.startsWith("/profile");

	const tabItemStyle = (isActive: boolean) => ({
		backgroundColor: isActive
			? isScholar
				? theme.primary
				: theme.card
			: "transparent",
		color: tabIconColor(isActive),
	});

	const tabIconColor = (isActive: boolean) =>
		isActive ? theme.bar.icon.selected : theme.bar.icon.default;

	const tabLabelStyle = (isActive: boolean) => ({
		color: isActive ? theme.bar.label.selected : theme.bar.label.default,
	});

	return (
		<Tabs className="flex h-screen min-h-0 flex-col overflow-y-scroll pb-24">
			<TabSlot className="flex-1 min-h-0 pb-20" />
			<TabList
				className={cn(
					"fixed bottom-0 z-50 w-full flex-row items-center justify-around border-t px-2 py-2 pb-6 shadow-lg border-border/60",
				)}
				style={{ backgroundColor: THEME[colorScheme].background }}
			>
				<TabTrigger
					name="index"
					href="/"
					className="flex-1 flex-col items-center justify-center gap-1 py-1"
				>
					<View
						className="rounded-full px-5 py-1"
						style={tabItemStyle(isHomeActive)}
					>
						<Icon
							icon={Home}
							size={24}
							color={tabIconColor(isHomeActive)}
						/>
					</View>
					<Text
						className="text-xs font-bold"
						style={tabLabelStyle(isHomeActive)}
					>
						Início
					</Text>
				</TabTrigger>

				<TabTrigger
					name="history"
					href="/history"
					className="flex-1 flex-col items-center justify-center gap-1 py-1"
				>
					<View
						className="rounded-full px-5 py-1"
						style={tabItemStyle(isHistoryActive)}
					>
						<Icon
							icon={MapIcon}
							size={24}
							color={tabIconColor(isHistoryActive)}
						/>
					</View>
					<Text
						className="text-xs font-bold"
						style={tabLabelStyle(isHistoryActive)}
					>
						Histórico
					</Text>
				</TabTrigger>

				<TabTrigger
					name="profile"
					href="/profile"
					className="flex-1 flex-col items-center justify-center gap-1 py-1"
				>
					<View
						className="rounded-full px-5 py-1"
						style={tabItemStyle(isProfileActive)}
					>
						<Icon
							icon={User}
							size={24}
							color={tabIconColor(isProfileActive)}
						/>
					</View>
					<Text
						className="text-xs font-bold"
						style={tabLabelStyle(isProfileActive)}
					>
						Perfil
					</Text>
				</TabTrigger>
			</TabList>
		</Tabs>
	);
}

function FloatingAppTabs() {
	const pathname = usePathname();

	const isHomeActive = pathname === "/";
	const isHistoryActive = pathname.startsWith("/history");
	const isProfileActive = pathname.startsWith("/profile");

	return (
		<Tabs className="flex h-screen min-h-0 flex-col bg-background overflow-y-scroll pb-24">
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

export default function AppTabs() {
	const variant = "floating";

	return variant === "floating" ? <FloatingAppTabs /> : <DefaultAppTabs />;
}
