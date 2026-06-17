import { useSyncExternalStore } from "react";

import { storage } from "@/lib/storage";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RouteHistoryEntry {
	id: string;
	lastTravel: string; // ISO timestamp
}

interface FrequentEntry extends RouteHistoryEntry {
	count: number;
}

interface RouteHistoryData {
	recent: RouteHistoryEntry[]; // max 3, most recent first
	frequent: FrequentEntry[]; // max 5, sorted by count desc
	hydrated: boolean; // whether API seed has been done
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "route-history";

const DEFAULT_DATA: RouteHistoryData = {
	recent: [],
	frequent: [],
	hydrated: false,
};

function readFromStorage(): RouteHistoryData {
	try {
		const raw = storage.getString(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<RouteHistoryData>;
			if (parsed.recent && parsed.frequent) {
				return {
					recent: parsed.recent ?? [],
					frequent: parsed.frequent ?? [],
					hydrated: parsed.hydrated ?? false,
				};
			}
		}
	} catch {
		// Ignore parse errors
	}
	return { ...DEFAULT_DATA };
}

function writeToStorage(data: RouteHistoryData) {
	try {
		storage.set(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// Storage may be full or unavailable
	}
}

// ─── State ───────────────────────────────────────────────────────────────────

let data: RouteHistoryData = readFromStorage();

const listeners = new Set<() => void>();

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Get the raw state (synchronous, for imperatives). */
export function getRouteHistory(): RouteHistoryData {
	return data;
}

/** Mark the store as hydrated (initial API seed done). */
export function markRouteHistoryHydrated() {
	data = { ...data, hydrated: true };
	writeToStorage(data);
	emitChange();
}

/**
 * Add a destination to the history after a completed trip.
 *
 * - Recent: pushes the destination to front (or moves it there), trims to 3.
 * - Frequent: increments count (or inserts with count 1), sorts desc, trims to 5.
 */
export function addRouteToHistory(
	destinationId: string,
	_destinationName: string,
	now = new Date(),
) {
	const lastTravel = now.toISOString();

	// ── Recent ──────────────────────────────────────────────────────────────
	let recent = data.recent.filter((e) => e.id !== destinationId);
	recent.unshift({ id: destinationId, lastTravel });
	if (recent.length > 3) recent = recent.slice(0, 3);

	// ── Frequent ────────────────────────────────────────────────────────────
	let frequent = data.frequent.filter((e) => e.id !== destinationId);
	const existingEntry = data.frequent.find((e) => e.id === destinationId);
	const count = (existingEntry?.count ?? 0) + 1;
	frequent.push({ id: destinationId, lastTravel, count });
	frequent.sort((a, b) => b.count - a.count || (a.lastTravel > b.lastTravel ? -1 : 1));
	if (frequent.length > 5) frequent = frequent.slice(0, 5);

	data = { ...data, recent, frequent };
	writeToStorage(data);
	emitChange();
}

/**
 * Seed the store from API history data (used on first launch for existing users).
 *
 * Expects items sorted by most recent first (as `studentHistory` returns them).
 */
export function hydrateRouteHistoryFromApi(
	items: ReadonlyArray<{
		destinationLocation: { id: string; name: string; abbreviation: string | null } | null;
		createdAt: string | Date;
	}>,
) {
	if (data.hydrated || items.length === 0) return;

	const seenIds = new Set<string>();
	const recent: RouteHistoryEntry[] = [];

	// Frequency map: id → { name, count, lastTravel }
	const freqMap = new Map<
		string,
		{ name: string; count: number; lastTravel: string }
	>();

	for (const item of items) {
		const dest = item.destinationLocation;
		if (!dest) continue;

		const id = dest.id;
		const displayName = dest.abbreviation || dest.name;
		const travelDate =
			typeof item.createdAt === "string"
				? item.createdAt
				: item.createdAt.toISOString();

		// Recent (first 3 unique)
		if (!seenIds.has(id)) {
			seenIds.add(id);
			recent.push({ id, lastTravel: travelDate });
			if (recent.length >= 3) break;
		}

		// Frequents (count all)
		const existing = freqMap.get(id);
		if (existing) {
			existing.count++;
			if (travelDate > existing.lastTravel) {
				existing.lastTravel = travelDate;
			}
		} else {
			freqMap.set(id, { name: displayName, count: 1, lastTravel: travelDate });
		}
	}

	const frequent: FrequentEntry[] = Array.from(freqMap.entries())
		.map(([id, info]) => ({ id, ...info }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	data = { recent, frequent, hydrated: true };
	writeToStorage(data);
	emitChange();
}

/** Look up a campus location by its ID, returning full data. */
function getLocationData(
	id: string,
): { name: string; abbreviation: string | null } | null {
	try {
		const raw = storage.getString("campus-locations");
		if (raw) {
			const locations = JSON.parse(raw) as Array<{
				id: string;
				name: string;
				abbreviation?: string | null;
			}>;
			const loc = locations.find((l) => l.id === id);
			if (loc) {
				return {
					name: loc.name,
					abbreviation: loc.abbreviation ?? null,
				};
			}
		}
	} catch {
		// ignore
	}
	return null;
}

/**
 * Resolve a RouteHistoryEntry into a display-friendly object.
 *
 * - `id`        – campus location ID (for programmatic lookup / navigation)
 * - `name`      – full name of the location
 * - `abbreviation` – abbreviation, or `null` if none
 * - `date`      – Date object of the last travel
 */
export function resolveRouteEntry(
	entry: RouteHistoryEntry,
): { id: string; name: string; abbreviation: string | null; date: Date } {
	const data = getLocationData(entry.id);
	return {
		id: entry.id,
		name: data?.name ?? entry.id,
		abbreviation: data?.abbreviation ?? null,
		date: new Date(entry.lastTravel),
	};
}

// ─── React hook ──────────────────────────────────────────────────────────────

export function useRouteHistory(): RouteHistoryData {
	return useSyncExternalStore(
		(subscribe) => {
			listeners.add(subscribe);
			return () => {
				listeners.delete(subscribe);
			};
		},
		() => data,
		() => DEFAULT_DATA,
	);
}
