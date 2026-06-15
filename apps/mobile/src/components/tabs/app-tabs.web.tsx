import { usePathname } from "expo-router";
import { TabList, TabSlot, Tabs, TabTrigger } from "expo-router/ui";
import { View } from "react-native";

import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useUserRole } from "@/lib/auth/store";
import { SCHOLAR_THEME, THEME } from "@/lib/theme";
import { useAppColorScheme } from "@/lib/theme/use-app-color-scheme";
import { cn } from "@/lib/utils";

import { TAB_DEFINITIONS, type TabDefinition } from "./app-tabs.config";

function DefaultAppTabs() {
	const pathname = usePathname();
	const colorScheme = useAppColorScheme();
	const role = useUserRole();
	const isScholar = role === "scholar";
	const theme = isScholar ? SCHOLAR_THEME[colorScheme] : THEME[colorScheme];

	const visibleTabs = TAB_DEFINITIONS.filter(
		(tab) => !tab.scholarOnly || isScholar,
	);

	const isActive = (tab: TabDefinition) =>
		tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

	const iconColor = (active: boolean) =>
		active ? theme.bar.icon.selected : theme.bar.icon.default;

	return (
		<Tabs className="flex h-screen min-h-0 flex-col overflow-y-scroll pb-24">
			<TabSlot className="flex-1 min-h-0 pb-20" />
			<TabList
				className={cn(
					"fixed bottom-0 z-50 w-full flex-row items-center justify-around border-t px-2 py-2 pb-6 shadow-lg border-border/60",
				)}
				style={{ backgroundColor: THEME[colorScheme].background }}
			>
				{visibleTabs.map((tab) => {
					const active = isActive(tab);
					return (
						<TabTrigger
							key={tab.name}
							name={tab.name}
							href={tab.href}
							className="flex-1 flex-col items-center justify-center gap-1 py-1"
						>
							<View
								className="rounded-full px-5 py-1"
								style={{
									backgroundColor: active
										? isScholar
											? theme.primary
											: theme.card
										: "transparent",
								}}
							>
								<Icon
									icon={tab.webDefaultIcon}
									size={24}
									color={iconColor(active)}
								/>
							</View>
							<Text
								className="text-xs font-bold"
								style={{
									color: active
										? theme.bar.label.selected
										: theme.bar.label.default,
								}}
							>
								{tab.label}
							</Text>
						</TabTrigger>
					);
				})}
			</TabList>
		</Tabs>
	);
}

function FloatingAppTabs() {
	const pathname = usePathname();
	const role = useUserRole();
	const isScholar = role === "scholar";

	const visibleTabs = TAB_DEFINITIONS.filter(
		(tab) => !tab.scholarOnly || isScholar,
	);

	const isActive = (tab: TabDefinition) =>
		tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

	return (
		<Tabs className="flex h-screen min-h-0 flex-col bg-background overflow-y-scroll pb-24">
			<TabSlot className="flex-1 min-h-0 pb-28" />
			<TabList className="fixed bottom-4 left-1/2 z-50 max-w-md -translate-x-1/2 flex-row items-center rounded-full border border-border/60 bg-background/95 px-2 py-2 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/80">
				{visibleTabs.map((tab) => {
					const active = isActive(tab);
					return (
						<TabTrigger
							key={tab.name}
							name={tab.name}
							href={tab.href}
							className={cn(
								"flex-1 flex-col items-center justify-center gap-0 rounded-full px-8 py-2 text-muted-foreground",
								active && "bg-card text-accent-foreground",
							)}
						>
							<Icon icon={tab.webFloatingIcon} size={24} />
							<Text
								className={cn("text-sm", {
									"text-accent-foreground": active,
								})}
							>
								{tab.label}
							</Text>
						</TabTrigger>
					);
				})}
			</TabList>
		</Tabs>
	);
}

export default function AppTabs() {
	const variant = "floating";

	return variant === "floating" ? <FloatingAppTabs /> : <DefaultAppTabs />;
}
