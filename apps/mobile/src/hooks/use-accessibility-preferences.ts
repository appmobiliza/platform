import { useEffect, useState } from "react";

import { AccessibilityInfo, Platform } from "react-native";

export function useAccessibilityPreferences() {
	const [reduceMotionEnabled, setReduceMotionEnabled] = useState(() => {
		if (Platform.OS !== "web") {
			return false;
		}

		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		) {
			return false;
		}

		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});
	const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

	useEffect(() => {
		let mounted = true;

		if (Platform.OS === "web") {
			if (
				typeof window === "undefined" ||
				typeof window.matchMedia !== "function"
			) {
				return;
			}

			const mediaQuery = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			);
			const handleChange = (event: MediaQueryListEvent) => {
				if (mounted) {
					setReduceMotionEnabled(event.matches);
				}
			};

			setReduceMotionEnabled(mediaQuery.matches);
			mediaQuery.addEventListener?.("change", handleChange);

			return () => {
				mounted = false;
				mediaQuery.removeEventListener?.("change", handleChange);
			};
		}

		AccessibilityInfo.isReduceMotionEnabled()
			.then((v) => mounted && setReduceMotionEnabled(v))
			.catch(() => mounted && setReduceMotionEnabled(false));

		AccessibilityInfo.isScreenReaderEnabled()
			.then((v) => mounted && setScreenReaderEnabled(v))
			.catch(() => mounted && setScreenReaderEnabled(false));

		const subReduce = AccessibilityInfo.addEventListener?.(
			"reduceMotionChanged",
			(v: boolean) => mounted && setReduceMotionEnabled(v),
		);

		const subSR = AccessibilityInfo.addEventListener?.(
			"screenReaderChanged",
			(v: boolean) => mounted && setScreenReaderEnabled(v),
		);

		return () => {
			mounted = false;
			try {
				if (subReduce) {
					const s = subReduce as
						| { remove?: () => void }
						| (() => void);
					if (
						typeof (s as { remove?: () => void }).remove ===
						"function"
					) {
						(s as { remove: () => void }).remove();
					} else if (typeof s === "function") {
						(s as () => void)();
					}
				}

				if (subSR) {
					const s2 = subSR as { remove?: () => void } | (() => void);
					if (
						typeof (s2 as { remove?: () => void }).remove ===
						"function"
					) {
						(s2 as { remove: () => void }).remove();
					} else if (typeof s2 === "function") {
						(s2 as () => void)();
					}
				}
			} catch {
				// ignore
			}
		};
	}, []);

	return { reduceMotionEnabled, screenReaderEnabled } as const;
}
