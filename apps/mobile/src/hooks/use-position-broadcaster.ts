import { useEffect, useRef } from "react";

import { trpc } from "@/lib/trpc/client";

import type { Coordinates } from "./use-user-location";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UsePositionBroadcasterOptions {
	/** Whether the broadcaster is active */
	enabled: boolean;

	/** The user's current geographic position (from useUserLocation) */
	location: Coordinates | null;

	/** If set, position will be published to the request channel as well */
	requestId?: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Broadcast the user's position to realtime channels so other users can
 * see them on the map.
 *
 * - **Scholars**: position is published to `scholar:positions` (visible to
 *   all students during search) and, if `requestId` is set, to
 *   `request:{requestId}` (visible to the specific student during a trip).
 * - **Students**: position is published to `request:{requestId}` (visible
 *   to the scholar during a trip).
 *
 * The actual broadcasting happens through the `requests.updatePosition` tRPC
 * mutation, which decides which channels to publish to based on the user's
 * role.
 *
 * Position updates are automatically throttled by the caller's
 * `useUserLocation` hook (default: every 5s / 10m movement).
 */
export function usePositionBroadcaster({
	enabled,
	location,
	requestId,
}: UsePositionBroadcasterOptions) {
	const updatePosition = trpc.requests.updatePosition.useMutation();
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

		updatePosition.mutate({
			latitude: location.latitude,
			longitude: location.longitude,
			requestId: requestId ?? undefined,
		});
	}, [enabled, location, requestId, updatePosition]);
}
