import { useSyncExternalStore } from "react";

import { storage } from "./storage";

export enum UserRole {
	Student = "student",
	Scholar = "scholar",
}

const IS_LOGGED_IN_KEY = "auth-is-logged-in";
const USER_ROLE_KEY = "auth-user-role";

let isLoggedIn = false;
let userRole: UserRole = UserRole.Student;

// Initialize from storage synchronously (MMKV is sync on native)
const storedIsLoggedIn = storage.getString(IS_LOGGED_IN_KEY);
if (storedIsLoggedIn === "true") {
	isLoggedIn = true;
}

const storedUserRole = storage.getString(USER_ROLE_KEY);
if (storedUserRole === UserRole.Student || storedUserRole === UserRole.Scholar) {
	userRole = storedUserRole as UserRole;
}

const listeners = new Set<() => void>();

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

export function setIsLoggedIn(value: boolean) {
	isLoggedIn = value;
	storage.set(IS_LOGGED_IN_KEY, String(value));
	emitChange();
}

export function setUserRole(role: UserRole) {
	userRole = role;
	storage.set(USER_ROLE_KEY, role);
	emitChange();
}

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

export function useIsLoggedIn() {
	return useSyncExternalStore(subscribe, () => isLoggedIn, () => false);
}

export function useUserRole() {
	return useSyncExternalStore(subscribe, () => userRole, () => UserRole.Student);
}
