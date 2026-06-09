import { useEffect, useRef, useState } from "react";

import type { ScholarPosition } from "@/lib/map-utils";
import { getRealtimeClient } from "@/lib/realtime";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseScholarTripPositionOptions {
	/** Whether the subscription is active */
	enabled: boolean;

	/** The active request ID to subscribe to */
	requestId?: string | null;

	/** Event name for position updates on the request channel */
	positionEvent?: string;
}

interface UseScholarTripPositionResult {
	/** The scholar's current real-time position */
	scholarPosition: ScholarPosition | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Subscribe to the specific scholar's position updates during a trip.
 *
 * Listens to the `request:{requestId}` channel for position events
 * broadcast by the scholar who is currently serving the request.
 */
export function useScholarTripPosition({
	enabled,
	requestId,
	positionEvent = "request:position",
}: UseScholarTripPositionOptions): UseScholarTripPositionResult {
	const [scholarPosition, setScholarPosition] =
		useState<ScholarPosition | null>(null);

	const channelRef = useRef<string | null>(null);

	useEffect(() => {
		if (!enabled || !requestId) {
			setScholarPosition(null);
			return;
		}

		const channel = `request:${requestId}`;
		channelRef.current = channel;
		let cancelled = false;

		const setup = async () => {
			const client = await getRealtimeClient();
			if (cancelled) return;

			const unsubPosition = client.subscribe(
				channel,
				positionEvent,
				(data: unknown) => {
					if (cancelled) return;

					const payload = data as {
						scholarId: string;
						latitude: number;
						longitude: number;
						heading?: number;
					};

					setScholarPosition({
						id: payload.scholarId ?? requestId,
						latitude: payload.latitude,
						longitude: payload.longitude,
						heading: payload.heading,
					});
				},
			);

			return () => {
				unsubPosition();
			};
		};

		const cleanupPromise = setup();

		return () => {
			cancelled = true;
			cleanupPromise.then((cleanup) => cleanup?.());
		};
	}, [enabled, requestId, positionEvent]);

	return { scholarPosition };
}
