export const THEME = {
	light: {
		background: "#F8F8F8",
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
		background: "#0F1313",
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
};

import { useUnstableNativeVariable as _useUnstableNativeVariable } from "nativewind";

export const useUnstableNativeVariable = (name: string) =>
	_useUnstableNativeVariable(name);
