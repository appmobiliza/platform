import { useSyncExternalStore } from "react";

import type { Place } from "@/components/request-flow-sheet/types";

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
