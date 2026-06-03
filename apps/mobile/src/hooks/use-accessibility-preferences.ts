import { useEffect, useState } from "react";

import { AccessibilityInfo } from "react-native";

export function useAccessibilityPreferences() {
	const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
	const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

	useEffect(() => {
		let mounted = true;

		AccessibilityInfo.isReduceMotionEnabled()
			.then((v) => {
				if (mounted) setReduceMotionEnabled(v);
			})
			.catch(() => {
				if (mounted) setReduceMotionEnabled(false);
			});

		AccessibilityInfo.isScreenReaderEnabled()
			.then((v) => {
				if (mounted) setScreenReaderEnabled(v);
			})
			.catch(() => {
				if (mounted) setScreenReaderEnabled(false);
			});

		const subReduce = AccessibilityInfo.addEventListener(
			"reduceMotionChanged",
			(v: boolean) => {
				if (mounted) setReduceMotionEnabled(v);
			},
		);
		const subSR = AccessibilityInfo.addEventListener(
			"screenReaderChanged",
			(v: boolean) => {
				if (mounted) setScreenReaderEnabled(v);
			},
		);

		return () => {
			mounted = false;
			subReduce.remove();
			subSR.remove();
		};
	}, []);

	return { reduceMotionEnabled, screenReaderEnabled } as const;
}
