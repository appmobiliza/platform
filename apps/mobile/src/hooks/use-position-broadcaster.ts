import { useEffect, useRef } from "react";

import { getRealtimeClient } from "@/lib/realtime";

import type { Coordinates } from "./use-user-location";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UsePositionBroadcasterOptions {
	/** Whether the broadcaster is active */
	enabled: boolean;

	/** The user's current geographic position (from useUserLocation) */
	location: Coordinates | null;

	/**
	 * Channel to broadcast position to.
	 *
	 * - `"scholar:positions"` → student sees scholar during search
	 * - `"request:{requestId}"` → other party sees during trip
	 */
	channel: string;

	/** Event name for the broadcast (default: `"position"`) */
	event?: string;

	/** Additional payload fields (e.g. `{ scholarId, studentId, heading }`) */
	payload?: Record<string, unknown>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Broadcast the user's position to a realtime channel so other users can
 * see them on the map.
 *
 * Position is published directly from the client via the realtime adapter
 * (no HTTP round-trip). Only sends when the coordinate actually changes.
 */
export function usePositionBroadcaster({
	enabled,
	location,
	channel,
	event = "position",
	payload = {},
}: UsePositionBroadcasterOptions) {
	const lastSentRef = useRef<{ lat: number; lng: number } | null>(null);

	useEffect(() => {
		if (!enabled || !location) return;

		// Skip if position hasn't changed since last send
		if (
			lastSentRef.current &&
			lastSentRef.current.lat === location.latitude &&
			lastSentRef.current.lng === location.longitude
		) {
			return;
		}

		lastSentRef.current = {
			lat: location.latitude,
			lng: location.longitude,
		};

		getRealtimeClient().then((client) => {
			client.publish(channel, event, {
				latitude: location.latitude,
				longitude: location.longitude,
				...payload,
			});
		});
	}, [enabled, location, channel, event, payload]);
}
