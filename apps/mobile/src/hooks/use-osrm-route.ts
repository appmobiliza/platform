import { useEffect, useRef } from "react";

import { fetchOSRMRoute, type OSRMProfile, type OSRMResult } from "@/lib/osrm";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseOsrmRouteOptions {
	/** Origin coordinates as [longitude, latitude] */
	origin: [number, number] | null;
	/** Destination coordinates as [longitude, latitude] */
	destination: [number, number] | null;
	/** Whether to fetch the route. Default: true */
	enabled?: boolean;
	/** OSRM profile. Default: "foot" */
	profile?: OSRMProfile;
	/** Polling interval in ms. Default: 30_000 */
	pollInterval?: number;
}

export interface UseOsrmRouteResult {
	/** The raw OSRM result, or null while loading / on failure */
	route: OSRMResult | null;
	/** True while the initial fetch is in progress */
	isLoading: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetch an OSRM route between two points, with automatic polling.
 *
 * Returns the raw route result (geometry, distance, duration) so consumers
 * can format it as needed (duration string, arrival time, map coordinates…).
 */
export function useOsrmRoute({
	origin,
	destination,
	enabled = true,
	profile = "foot",
	pollInterval = 30_000,
}: UseOsrmRouteOptions): UseOsrmRouteResult {
	const resultRef = useRef<OSRMResult | null>(null);
	const isLoadingRef = useRef(false);

	// We store the latest settled value in a ref so the render cycle sees a
	// stable reference; the `route` field changes only when a new fetch completes.
	// For simplicity we return a fresh object each render – consumers that need
	// referential stability can memoize.

	const fetchRoute = async (signal: { cancelled: boolean }) => {
		if (!origin || !destination) {
			if (!signal.cancelled) {
				resultRef.current = null;
				isLoadingRef.current = false;
			}
			return;
		}

		isLoadingRef.current = true;
		const result = await fetchOSRMRoute(origin, destination, profile);

		if (!signal.cancelled) {
			resultRef.current = result;
			isLoadingRef.current = false;
		}
	};

	// Effectively recreate `fetchRoute` when dependencies change.
	// The `cancelled` pattern inside the effect handles cleanup correctly.
	useEffect(() => {
		if (!enabled) {
			resultRef.current = null;
			isLoadingRef.current = false;
			return;
		}

		const signal = { cancelled: false };

		const run = async () => {
			await fetchRoute(signal);
		};

		run();

		const interval = setInterval(() => {
			fetchRoute(signal);
		}, pollInterval);

		return () => {
			signal.cancelled = true;
			clearInterval(interval);
		};
		// Intentionally re-run when coordinates or config change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		enabled,
		origin?.[0],
		origin?.[1],
		destination?.[0],
		destination?.[1],
		profile,
		pollInterval,
	]);

	return {
		route: resultRef.current,
		isLoading: isLoadingRef.current,
	};
}
