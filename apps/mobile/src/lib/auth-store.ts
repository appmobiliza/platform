import { useSyncExternalStore } from "react";

type UserRole = "student" | "scholar";

let isLoggedIn = false;
let userRole: UserRole = "student";

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

export function setUserRole(role: UserRole) {
	userRole = role;
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

export function useUserRole() {
	return useSyncExternalStore(
		(subscribe) => {
			listeners.add(subscribe);
			return () => {
				listeners.delete(subscribe);
			};
		},
		() => userRole,
		() => "student",
	);
}

