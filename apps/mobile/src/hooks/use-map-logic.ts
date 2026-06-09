import { useEffect, useState } from "react";

import type { Place } from "@/components/request-flow-sheet/types";

import { formatDistance, haversineMeters } from "@/lib/distance";
import {
	buildRouteGeoJSON,
	calculateBounds,
	estimateTravelTime,
	formatEta,
	type LngLat,
	type ScholarPosition,
} from "@/lib/map-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MapMode = "free" | "destination" | "route" | "tracking";

export type { ScholarPosition };

interface UseMapLogicOptions {
	/** What the map is being used for */
	mode: MapMode;

	/** Origin point (used in route/tracking modes) */
	origin?: Place | null;

	/** Destination point (used in route/tracking modes) */
	destination?: Place | null;

	/** Scholar positions for real-time tracking */
	scholarPositions?: ScholarPosition[];

	/** Whether to continuously track user position */
	trackUser?: boolean;
}

interface UseMapLogicResult {
	/** User's current geographic position, or null */
	currentPosition: LngLat | null;

	/** User's current position as Place (for display) */
	currentPlace: Place | null;

	/** Route GeoJSON from origin to destination (or user to destination) */
	routeGeoJSON: ReturnType<typeof buildRouteGeoJSON> | null;

	/** Distance between the two relevant points as a human string */
	distanceText: string;

	/** Distance in meters */
	distanceMeters: number;

	/** ETA formatted as human-readable string */
	etaText: string;

	/** ETA in seconds */
	etaSeconds: number;

	/** Bounds that fit all relevant points */
	bounds: ReturnType<typeof calculateBounds>;

	/** All coordinates that should be visible (for fitting camera) */
	allCoordinates: LngLat[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMapLogic({
	mode,
	origin,
	destination,
	scholarPositions = [],
	trackUser = true,
}: UseMapLogicOptions): UseMapLogicResult {
	const [currentPosition, setCurrentPosition] = useState<LngLat | null>(null);

	// ─── Track user position ──────────────────────────────────────────────────

	useEffect(() => {
		if (!trackUser) return;

		const watchId = navigator.geolocation.watchPosition(
			({ coords }) => {
				setCurrentPosition([coords.longitude, coords.latitude]);
			},
			(err) => console.warn("[useMapLogic] Geolocation error:", err),
			{ enableHighAccuracy: true },
		);

		return () => navigator.geolocation.clearWatch(watchId);
	}, [trackUser]);

	// ─── Build route GeoJSON ──────────────────────────────────────────────────

	let routeGeoJSON: ReturnType<typeof buildRouteGeoJSON> | null = null;
	let distanceMeters = 0;
	let etaSeconds = 0;

	const originLngLat: LngLat | null = origin
		? [origin.longitude, origin.latitude]
		: null;

	const destinationLngLat: LngLat | null = destination
		? [destination.longitude, destination.latitude]
		: null;

	if (mode === "route" || mode === "tracking") {
		// For route/tracking, show path from user position to destination
		// (or origin to destination when both are fixed)
		const from = currentPosition ?? originLngLat;
		const to = destinationLngLat;

		if (from && to) {
			routeGeoJSON = buildRouteGeoJSON(from, to);
			distanceMeters = haversineMeters(from[1], from[0], to[1], to[0]);
			etaSeconds = estimateTravelTime(distanceMeters, "mobility");
		}
	} else if (mode === "destination") {
		// In destination mode, we might show user's position
		// Route is not shown but distance can be calculated
		if (currentPosition && destinationLngLat) {
			distanceMeters = haversineMeters(
				currentPosition[1],
				currentPosition[0],
				destinationLngLat[1],
				destinationLngLat[0],
			);
		}
	}

	// ─── Build bounds ────────────────────────────────────────────────────────

	const allCoordinates: LngLat[] = [];

	if (currentPosition) allCoordinates.push(currentPosition);
	if (originLngLat) allCoordinates.push(originLngLat);
	if (destinationLngLat) allCoordinates.push(destinationLngLat);

	for (const sp of scholarPositions) {
		allCoordinates.push([sp.longitude, sp.latitude]);
	}

	const bounds = calculateBounds(allCoordinates);

	// ─── Result ──────────────────────────────────────────────────────────────

	const currentPlace: Place | null = currentPosition
		? {
			name: "Minha localização",
			latitude: currentPosition[1],
			longitude: currentPosition[0],
		}
		: null;

	return {
		currentPosition,
		currentPlace,
		routeGeoJSON,
		distanceText: formatDistance(distanceMeters),
		distanceMeters,
		etaText: etaSeconds > 0 ? formatEta(etaSeconds) : "--",
		etaSeconds,
		bounds,
		allCoordinates,
	};
}
