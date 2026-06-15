import { useSyncExternalStore } from "react";

import type { Place } from "@/components/request-flow-sheet/types";

import { storage } from "@/lib/storage";

let nearestPoint: Place | null = null;

const listeners = new Set<() => void>();

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

export function setNearestPoint(point: Place | null) {
	nearestPoint = point;
	emitChange();
}

export function getNearestPoint(): Place | null {
	return nearestPoint;
}

export function useNearestPoint(): Place | null {
	return useSyncExternalStore(
		(subscribe) => {
			listeners.add(subscribe);
			return () => {
				listeners.delete(subscribe);
			};
		},
		() => nearestPoint,
		() => null,
	);
}

// ─── Campus locations cache (persisted between sessions) ────────────────────

const CAMPUS_LOCATIONS_KEY = "campus-locations";

export function getCachedCampusLocations(): Place[] {
	try {
		const raw = storage.getString(CAMPUS_LOCATIONS_KEY);
		if (raw) return JSON.parse(raw) as Place[];
	} catch {
		// Ignore parse errors
	}
	return [];
}

export function setCachedCampusLocations(locations: Place[]) {
	try {
		storage.set(CAMPUS_LOCATIONS_KEY, JSON.stringify(locations));
	} catch {
		// Storage may be full or unavailable
	}
}
