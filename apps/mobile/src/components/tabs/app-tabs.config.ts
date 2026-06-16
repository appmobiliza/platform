import type { AndroidSymbol } from "expo-symbols";
import type { LucideIcon } from "lucide-react-native";
import { CalendarIcon, Home, Map as MapIcon, User } from "lucide-react-native";
import type { SFSymbol } from "sf-symbols-typescript";

export type NativeIconConfig = {
	sf: SFSymbol | { default?: SFSymbol; selected: SFSymbol };
	md: AndroidSymbol | { default?: AndroidSymbol; selected: AndroidSymbol };
};

export type TabDefinition = {
	name: string;
	href: string;
	label: string;
	/** Icon used by the default (bottom-bar) web variant */
	webDefaultIcon: LucideIcon;
	/** Icon used by the floating web variant */
	webFloatingIcon: LucideIcon;
	nativeIcon: NativeIconConfig;
	/** When true, the tab is only rendered for scholar users */
	scholarOnly?: boolean;
};

export const TAB_DEFINITIONS: TabDefinition[] = [
	{
		name: "index",
		href: "/",
		label: "Início",
		webDefaultIcon: Home,
		webFloatingIcon: Home,
		nativeIcon: {
			sf: { default: "house", selected: "house.fill" },
			md: { default: "home", selected: "home_filled" },
		},
	},
	{
		name: "history",
		href: "/history",
		label: "Histórico",
		webDefaultIcon: CalendarIcon,
		webFloatingIcon: MapIcon,
		nativeIcon: {
			sf: "map",
			md: { default: "map", selected: "map" },
		},
	},
	{
		name: "schedule",
		href: "/schedule",
		label: "Cronograma",
		webDefaultIcon: MapIcon,
		webFloatingIcon: CalendarIcon,
		nativeIcon: {
			sf: "calendar",
			md: { default: "calendar_clock", selected: "calendar_clock" },
		},
		scholarOnly: true,
	},
	{
		name: "profile",
		href: "/profile",
		label: "Perfil",
		webDefaultIcon: User,
		webFloatingIcon: User,
		nativeIcon: {
			sf: "person",
			md: {
				default: "account_circle",
				selected: "account_circle",
			},
		},
	},
];
