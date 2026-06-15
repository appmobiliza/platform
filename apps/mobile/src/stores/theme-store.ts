import { useSyncExternalStore } from "react";

import { storage } from "@/lib/storage";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "theme-preference";

let themePreference: ThemePreference = "system";

// Initialize from storage synchronously (MMKV is sync on native)
const stored = storage.getString(STORAGE_KEY);
if (stored === "light" || stored === "dark" || stored === "system") {
	themePreference = stored;
}

const listeners = new Set<() => void>();

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

export function getThemePreference(): ThemePreference {
	return themePreference;
}

export function setThemePreference(preference: ThemePreference) {
	themePreference = preference;
	storage.set(STORAGE_KEY, preference);
	emitChange();
}

export function useThemePreference(): ThemePreference {
	return useSyncExternalStore(
		(subscribe) => {
			listeners.add(subscribe);
			return () => {
				listeners.delete(subscribe);
			};
		},
		() => themePreference,
		() => "system",
	);
}
