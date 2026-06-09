import { useEffect, useRef, useState } from "react";

import { fetchOSRMRoute, type OSRMProfile, type OSRMResult } from "@/lib/osrm";

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Minimum coordinate change (degrees) before triggering a new route fetch.
 * 0.0003° ≈ 30 m — avoids re-fetching when GPS jitters by tiny amounts.
 */
const COORD_THRESHOLD = 0.0003;

/** True if either coordinate of the pair differs by more than the threshold. */
function hasMoved(a: [number, number], b: [number, number]): boolean {
	return (
		Math.abs(a[0] - b[0]) > COORD_THRESHOLD ||
		Math.abs(a[1] - b[1]) > COORD_THRESHOLD
	);
}

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
 * Skips the actual HTTP request when the coordinates have not moved
 * by more than ~30 m to avoid rate limiting on the OSRM API.
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
	const [route, setRoute] = useState<OSRMResult | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Track last fetched coordinates so we can skip when position barely moves.
	const lastOrigin = useRef<[number, number] | null>(null);
	const lastDest = useRef<[number, number] | null>(null);

	const shouldSkip = (): boolean => {
		if (!origin || !destination) return false;
		if (!lastOrigin.current || !lastDest.current) return false;
		return (
			!hasMoved(origin, lastOrigin.current) &&
			!hasMoved(destination, lastDest.current)
		);
	};

	const fetchRoute = async (signal: { cancelled: boolean }) => {
		if (!origin || !destination) {
			console.log("[useOsrmRoute] Skipped — missing origin or destination", {
				origin,
				destination,
			});
			if (!signal.cancelled) {
				setRoute(null);
				setIsLoading(false);
			}
			return;
		}

		if (shouldSkip()) {
			console.log("[useOsrmRoute] Skipped — coordinates unchanged");
			return;
		}

		console.log("[useOsrmRoute] Fetching route", {
			origin,
			destination,
			profile,
			enabled,
		});

		setIsLoading(true);
		const result = await fetchOSRMRoute(origin, destination, profile);

		console.log("[useOsrmRoute] Result:", result ? "success" : "null");

		if (!signal.cancelled) {
			setRoute(result);
			setIsLoading(false);
			lastOrigin.current = origin;
			lastDest.current = destination;
		}
	};

	// Effectively recreate `fetchRoute` when dependencies change.
	// The `cancelled` pattern inside the effect handles cleanup correctly.
	useEffect(() => {
		if (!enabled) {
			setRoute(null);
			setIsLoading(false);
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

	console.log(
		"[useOsrmRoute] Render — route:",
		route ? "set" : "null",
		"| origin:",
		origin,
		"| dest:",
		destination,
	);

	return { route, isLoading };
}
