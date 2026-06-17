import { useCallback, useEffect, useRef } from "react";

import { calculateRouteDistance } from "@/lib/geo/distance";
import { simplifyRDP } from "@/lib/geo/simplify";

import { useUserLocation } from "./use-user-location";

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * A route point in GeoJSON format: [longitude, latitude, unix_timestamp_ms]
 */
type RouteCoord = [number, number, number];

/**
 * GeoJSON LineString with timestamped coordinates.
 */
export interface RouteGeojson {
	type: "LineString";
	coordinates: RouteCoord[];
}

interface UseRouteTrackingOptions {
	/** Whether route tracking is active */
	enabled: boolean;
	/** Minimum distance (meters) between recorded points. Default: 10 */
	minDistance?: number;
	/** Minimum time (ms) between recorded points. Default: 10000 (10s) */
	minInterval?: number;
}

interface UseRouteTrackingReturn {
	/** Current accumulated route points (raw, non-simplified) */
	points: RouteCoord[];
	/** Get the simplified GeoJSON LineString ready for submission */
	getRouteGeojson: () => RouteGeojson;
	/** Get the total distance in meters from the raw points */
	getDistanceMeters: () => number;
	/** Reset the accumulated route (call when starting a new trip) */
	resetRoute: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Tracks the user's GPS position during an attendance and accumulates
 * route points for later submission when the attendance is completed.
 *
 * Points are stored in a ref to avoid unnecessary re-renders — only
 * the count is exposed via state for UI feedback.
 *
 * On completion, call `getRouteGeojson()` to get the simplified route
 * and `getDistanceMeters()` for the raw distance.
 *
 * @example
 * ```tsx
 * const { getRouteGeojson, getDistanceMeters, resetRoute } = useRouteTracking({
 *   enabled: isDuring && !hasCompleted,
 * });
 *
 * const handleComplete = () => {
 *   completeAttendance({
 *     requestId,
 *     routeGeojson: getRouteGeojson(),
 *     distanceMeters: getDistanceMeters(),
 *   });
 * };
 * ```
 */
export function useRouteTracking({
	enabled,
	minDistance = 10,
	minInterval = 10000,
}: UseRouteTrackingOptions): UseRouteTrackingReturn {
	const location = useUserLocation({
		enabled,
		timeInterval: 3000,
		distanceInterval: 5,
	});

	// Store accumulated points in a ref to avoid re-renders on every GPS tick
	const pointsRef = useRef<RouteCoord[]>([]);
	const lastRecordedRef = useRef<{
		lat: number;
		lng: number;
		time: number;
	} | null>(null);

	useEffect(() => {
		if (!enabled || !location) return;

		const now = Date.now();

		// Check if we should record this point
		if (lastRecordedRef.current) {
			const timeDelta = now - lastRecordedRef.current.time;
			const distDelta = haversineMeters(
				lastRecordedRef.current.lat,
				lastRecordedRef.current.lng,
				location.latitude,
				location.longitude,
			);

			if (timeDelta < minInterval && distDelta < minDistance) {
				return; // Skip — not enough change
			}
		}

		// Record the point as [lng, lat, unix_ms]
		pointsRef.current.push([location.longitude, location.latitude, now]);
		lastRecordedRef.current = {
			lat: location.latitude,
			lng: location.longitude,
			time: now,
		};
	}, [enabled, location, minDistance, minInterval]);

	const getRouteGeojson = useCallback((): RouteGeojson => {
		const raw = pointsRef.current;
		if (raw.length === 0) {
			return { type: "LineString", coordinates: [] };
		}

		const simplified = simplifyRDP(raw, 8);
		return { type: "LineString", coordinates: simplified };
	}, []);

	const getDistanceMeters = useCallback((): number => {
		return calculateRouteDistance(pointsRef.current);
	}, []);

	const resetRoute = useCallback(() => {
		pointsRef.current = [];
		lastRecordedRef.current = null;
	}, []);

	return {
		points: pointsRef.current,
		getRouteGeojson,
		getDistanceMeters,
		resetRoute,
	};
}

// ─── Haversine (local copy to avoid circ. dep. with simplify) ────────────────

function haversineMeters(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6_371_000;
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const φ1 = toRad(lat1);
	const φ2 = toRad(lat2);
	const Δφ = toRad(lat2 - lat1);
	const Δλ = toRad(lon2 - lon1);
	const a =
		Math.sin(Δφ / 2) ** 2 +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(a));
}
