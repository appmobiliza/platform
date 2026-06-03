import type { ColorSchemeName } from "react-native";
import { useUserRole } from "./auth-store";

export type ThemeColors = {
	primary: string;
	background: string;
	card: string;
	muted: string;
	bar: {
		background: string;
		label: {
			default: string;
			selected: string;
		};
		icon: {
			default: string;
			selected: string;
		};
		indicator: string;
		ripple: string;
	};
};

type ThemeConfig = Record<ColorSchemeName, ThemeColors | Record<string, never>>;

export const THEME: ThemeConfig = {
	light: {
		primary: "#005E65",
		background: "#F8F8F8",
		card: "#FFFFFF",
		muted: "#737373",
		bar: {
			background: "#ededed",
			label: {
				default: "#3F4849",
				selected: "#4A6365",
			},
			icon: {
				default: "#3F4849",
				selected: "#324B4E",
			},
			indicator: "#CCE8EA",
			ripple: "rgba(22, 29, 29, 0.08)",
		},
	},
	dark: {
		primary: "#005E65",
		background: "#0F1313",
		card: "#1A1F1F",
		muted: "#A3A3A3",
		bar: {
			background: "#1A2121",
			label: {
				default: "#BEC8C9",
				selected: "#B1CBCE",
			},
			icon: {
				default: "#BEC8C9",
				selected: "#CCE8EA",
			},
			indicator: "#324B4E",
			ripple: "rgba(222, 228, 228, 0.10)",
		},
	},
	unspecified: {},
};

export const SCHOLAR_THEME: ThemeColors = {
	primary: "#0A2540",
	background: "#0F1313",
	card: "#1A1F1F",
	muted: "#A3A3A3",
	bar: {
		background: "#1A1F1F",
		label: {
			default: "#A3A3A3",
			selected: "#60A5FA",
		},
		icon: {
			default: "#A3A3A3",
			selected: "#FFFFFF",
		},
		indicator: "#0A2540",
		ripple: "rgba(255, 255, 255, 0.1)",
	},
};

export const useUnstableNativeVariable = (name: string) => `var(${name})`;

const scholarTheme = {
	"--primary": "#0A2540",
	"--accent": "#29567B",
	"--accent-foreground": "#4B799F",
};

export function useThemeVariables() {
	const role = useUserRole();
	return role === "scholar"
		? scholarTheme
		: {};
}
