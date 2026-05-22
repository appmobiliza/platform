import { useSyncExternalStore } from "react";

let isLoggedIn = false;
const listeners = new Set<() => void>();

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

export function setIsLoggedIn(value: boolean) {
	isLoggedIn = value;
	emitChange();
}

export function useIsLoggedIn() {
	return useSyncExternalStore(
		(subscribe) => {
			listeners.add(subscribe);
			return () => {
				listeners.delete(subscribe);
			};
		},
		() => isLoggedIn,
		() => false,
	);
}
