import { useSyncExternalStore } from "react";

import { storage } from "@/lib/storage";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ActiveAttendanceData {
	requestId: string;
	studentName: string;
	disability: string;
	observation: string;
	originName: string;
	destinationName: string;
	startedAt: string | null; // ISO string
	acceptedAt: string; // ISO string
}

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "active-attendance";

const DEFAULT_STATE: ActiveAttendanceData | null = null;

// ─── Estado em memória (inicializado do MMKV) ────────────────────────────────

let activeAttendance: ActiveAttendanceData | null = readFromStorage();

function readFromStorage(): ActiveAttendanceData | null {
	try {
		const raw = storage.getString(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as ActiveAttendanceData;
			if (parsed.requestId) {
				return parsed;
			}
		}
	} catch {
		// Ignore parse errors
	}
	return null;
}

function writeToStorage(data: ActiveAttendanceData) {
	try {
		storage.set(STORAGE_KEY, JSON.stringify(data));
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

export function saveActiveAttendance(data: ActiveAttendanceData) {
	activeAttendance = data;
	writeToStorage(data);
	emitChange();
}

export function clearActiveAttendance() {
	activeAttendance = null;
	clearStorage();
	emitChange();
}

export function getActiveAttendance(): ActiveAttendanceData | null {
	return activeAttendance;
}

export function useActiveAttendance(): ActiveAttendanceData | null {
	return useSyncExternalStore(
		(subscribe) => {
			listeners.add(subscribe);
			return () => {
				listeners.delete(subscribe);
			};
		},
		() => activeAttendance,
		() => DEFAULT_STATE,
	);
}
