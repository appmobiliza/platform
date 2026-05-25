import { useUnstableNativeVariable as _useUnstableNativeVariable } from "nativewind";
import type { ColorSchemeName } from "react-native";

type ThemeColors = {
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

export const useUnstableNativeVariable = (name: string) =>
	// @ts-expect-error - nativewind web stub returns never, but native works correctly
	_useUnstableNativeVariable(name);
