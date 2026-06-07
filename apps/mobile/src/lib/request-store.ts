import { useSyncExternalStore } from "react";

import type { Place } from "@/components/request-flow-sheet/types";

import { storage } from "./storage";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type SearchState = "idle" | "searching" | "unattended" | "error";
export type Stage = "destination" | "destination-selection" | "start-confirm" | "searching" | "trip";

interface PersistedRequestState {
	activeRequestId: string | null;
	searchState: SearchState;
	stage: Stage;
	origin: Place | null;
	destination: Place | null;
	message: string;
	requestCreatedAt: number | null; // timestamp ms
}

// ─── Storage keys ────────────────────────────────────────────────────────────

const STORAGE_KEY = "request-flow-state";

const DEFAULT_STATE: PersistedRequestState = {
	activeRequestId: null,
	searchState: "idle",
	stage: "destination-selection",
	origin: null,
	destination: null,
	message: "",
	requestCreatedAt: null,
};

// ─── Estado em memória (inicializado do MMKV) ────────────────────────────────

let requestState: PersistedRequestState = readFromStorage();

function readFromStorage(): PersistedRequestState {
	try {
		const raw = storage.getString(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<PersistedRequestState>;

			// Validação básica: se activeRequestId existe, restaura; senão, default
			if (parsed.activeRequestId) {
				return {
					...DEFAULT_STATE,
					...parsed,
				};
			}
		}
	} catch {
		// Ignore parse errors
	}
	return { ...DEFAULT_STATE };
}

function writeToStorage(state: PersistedRequestState) {
	try {
		storage.set(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Storage unavailable
	}
}

function clearStorage() {
	try {
		storage.remove(STORAGE_KEY);
	} catch {
		// ignore
	}
}

// ─── Reactive subscriptions ──────────────────────────────────────────────────

const listeners = new Set<() => void>();

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function setRequestState(partial: Partial<PersistedRequestState>) {
	requestState = { ...requestState, ...partial };
	writeToStorage(requestState);
	emitChange();
}

export function clearRequestState() {
	requestState = { ...DEFAULT_STATE };
	clearStorage();
	emitChange();
}

export function getRequestState(): PersistedRequestState {
	return requestState;
}

export function useRequestState(): PersistedRequestState {
	return useSyncExternalStore(
		(subscribe) => {
			listeners.add(subscribe);
			return () => {
				listeners.delete(subscribe);
			};
		},
		() => requestState,
		() => DEFAULT_STATE,
	);
}
