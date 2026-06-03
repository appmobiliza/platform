import { useEffect, useState } from "react";

export function useAccessibilityPreferences() {
	const [reduceMotionEnabled, setReduceMotionEnabled] = useState(() => {
		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		) {
			return false;
		}
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});

	// Leitores de tela não são detectáveis via API síncrona na web
	const screenReaderEnabled = false;

	useEffect(() => {
		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		) {
			return;
		}

		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

		const handleChange = (event: MediaQueryListEvent) => {
			setReduceMotionEnabled(event.matches);
		};

		setReduceMotionEnabled(mediaQuery.matches);
		mediaQuery.addEventListener("change", handleChange);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	return { reduceMotionEnabled, screenReaderEnabled } as const;
}
