import { usePathname } from "expo-router";
import { TabList, TabSlot, Tabs, TabTrigger } from "expo-router/ui";
import { Home, Map as MapIcon, User } from "lucide-react-native";
import { useColorScheme, View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useUserRole } from "@/lib/auth-store";
import { SCHOLAR_THEME, THEME } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function AppTabs() {
	const pathname = usePathname();
	const colorScheme = useColorScheme();
	const role = useUserRole();
	const isScholar = role === "scholar";
	const theme = isScholar
		? SCHOLAR_THEME
		: colorScheme === "dark"
			? THEME.dark
			: THEME.light;

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
