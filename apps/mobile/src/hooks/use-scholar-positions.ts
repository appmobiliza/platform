import { useEffect, useState } from "react";

import { getRealtimeClient } from "@/lib/realtime";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RealtimeScholarPosition {
	id: string;
	latitude: number;
	longitude: number;
	heading?: number;
	/** Timestamp of the position update */
	timestamp: number;
}

interface UseScholarPositionsOptions {
	/** Whether the subscription is active */
	enabled?: boolean;

	/** Channel prefix for scholar position updates */
	channelPrefix?: string;

	/** Event name for position updates */
	positionEvent?: string;

	/** Event name for scholar going offline */
	offlineEvent?: string;
}

interface UseScholarPositionsResult {
	/** Current positions of all online scholars */
	scholarPositions: RealtimeScholarPosition[];

	/** Number of online scholars */
	onlineCount: number;

	/** Whether any scholars are online at all */
	hasOnlineScholars: boolean;

	/** Whether all online scholars are busy (no one available) */
	allBusy: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Subscribe to real-time scholar position updates.
 *
 * Listens to the `scholar:positions` channel for position pings and
 * the `scholar:status` channel for online/offline/busy status changes.
 */
export function useScholarPositions({
	enabled,
	channelPrefix = "scholar",
	positionEvent = "position",
	offlineEvent = "offline",
}: UseScholarPositionsOptions = {}): UseScholarPositionsResult {
	const [scholarPositions, setScholarPositions] = useState<
		RealtimeScholarPosition[]
	>([]);

	useEffect(() => {
		if (!enabled) {
			setScholarPositions([]);
			return;
		}

		let cancelled = false;

		const setup = async () => {
			const client = await getRealtimeClient();
			if (cancelled) return;

			// Listen for position updates from all scholars
			const unsubPosition = client.subscribe(
				`${channelPrefix}:positions`,
				positionEvent,
				(data: unknown) => {
					if (cancelled) return;
					const payload = data as {
						scholarId: string;
						latitude: number;
						longitude: number;
						heading?: number;
					};

					setScholarPositions((prev) => {
						const existing = prev.findIndex(
							(s) => s.id === payload.scholarId,
						);
						const updated: RealtimeScholarPosition = {
							id: payload.scholarId,
							latitude: payload.latitude,
							longitude: payload.longitude,
							heading: payload.heading,
							timestamp: Date.now(),
						};

						if (existing >= 0) {
							const next = [...prev];
							next[existing] = updated;
							return next;
						}

						return [...prev, updated];
					});
				},
			);

			// Listen for scholars going offline
			const unsubOffline = client.subscribe(
				`${channelPrefix}:status`,
				offlineEvent,
				(data: unknown) => {
					if (cancelled) return;
					const payload = data as { scholarId: string };
					setScholarPositions((prev) =>
						prev.filter((s) => s.id !== payload.scholarId),
					);
				},
			);

			return () => {
				unsubPosition();
				unsubOffline();
			};
		};

		const cleanupPromise = setup();

		return () => {
			cancelled = true;
			cleanupPromise.then((cleanup) => cleanup?.());
		};
	}, [enabled, channelPrefix, positionEvent, offlineEvent]);

	return {
		scholarPositions,
		onlineCount: scholarPositions.length,
		hasOnlineScholars: scholarPositions.length > 0,
		// We consider all busy when there are scholars online but none available
		// In practice, the backend would indicate availability via a separate status field
		allBusy: false,
	};
}
