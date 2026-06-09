import type { Place } from "@/components/request-flow-sheet/types";

import { haversineMeters, type LatLng } from "./distance";

// ─── Shared types ─────────────────────────────────────────────────────────────

export type LngLat = [number, number]; // [longitude, latitude]

/** A scholar's geographic position, optionally with heading */
export interface ScholarPosition {
	id: string;
	latitude: number;
	longitude: number;
	heading?: number;
}

// ─── GeoJSON builders ─────────────────────────────────────────────────────────

/** Build a GeoJSON LineString Feature between two points */
export function buildRouteGeoJSON(
	origin: LngLat,
	destination: LngLat,
): GeoJSON.Feature<GeoJSON.LineString> {
	return {
		type: "Feature",
		properties: {},
		geometry: {
			type: "LineString",
			coordinates: [origin, destination],
		},
	};
}

/** Build a GeoJSON LineString Feature from a path of coordinates */
export function buildPathGeoJSON(
	path: LngLat[],
): GeoJSON.Feature<GeoJSON.LineString> {
	return {
		type: "Feature",
		properties: {},
		geometry: {
			type: "LineString",
			coordinates: path,
		},
	};
}

/** Build a GeoJSON Point Feature */
export function buildPointGeoJSON(
	coord: LngLat,
	properties?: Record<string, unknown>,
): GeoJSON.Feature<GeoJSON.Point> {
	return {
		type: "Feature",
		properties: properties ?? {},
		geometry: {
			type: "Point",
			coordinates: coord,
		},
	};
}

// ─── Nearest campus location ─────────────────────────────────────────────────

export interface CampusLocation {
	name: string;
	latitude: number;
	longitude: number;
	abbreviation?: string;
}

/**
 * Find the nearest campus location to a given coordinate.
 * Returns null if no locations are provided.
 */
export function findNearestCampusLocation(
	latitude: number,
	longitude: number,
	locations: readonly CampusLocation[],
): CampusLocation | null {
	if (locations.length === 0) return null;

	const first = locations[0];
	if (!first) return null;

	let nearest: CampusLocation = first;
	let minDistance = haversineMeters(
		latitude,
		longitude,
		nearest.latitude,
		nearest.longitude,
	);

	for (let i = 1; i < locations.length; i++) {
		const loc = locations[i];
		if (!loc) continue;
		const dist = haversineMeters(
			latitude,
			longitude,
			loc.latitude,
			loc.longitude,
		);
		if (dist < minDistance) {
			minDistance = dist;
			nearest = loc;
		}
	}

	return nearest;
}

// ─── ETA / speed ─────────────────────────────────────────────────────────────

/** Average walking speed in m/s (~5 km/h) */
const WALKING_SPEED_MS = 1.4;

/** Average driving/mobility speed in m/s (~20 km/h) */
const MOBILITY_SPEED_MS = 5.6;

/**
 * Estimate travel time in seconds based on distance and mode.
 */
export function estimateTravelTime(
	distanceMeters: number,
	mode: "walking" | "mobility" = "mobility",
): number {
	const speed = mode === "walking" ? WALKING_SPEED_MS : MOBILITY_SPEED_MS;
	return Math.round(distanceMeters / speed);
}

/**
 * Format seconds into a human-readable ETA string.
 * Examples: "2 min", "15 min", "1h 05min"
 */
export function formatEta(seconds: number): string {
	if (seconds < 60) {
		return `${seconds}s`;
	}

	const minutes = Math.round(seconds / 60);
	if (minutes < 60) {
		return `${minutes} min`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}min`;
}

// ─── Bounds calculator ───────────────────────────────────────────────────────

export interface Bounds {
	north: number;
	south: number;
	east: number;
	west: number;
}

/**
 * Calculate bounding box that fits all given coordinates with optional padding.
 */
export function calculateBounds(
	coordinates: LngLat[],
	paddingMeters = 200,
): Bounds {
	if (coordinates.length === 0) {
		// Default to UFAL campus
		return {
			north: -9.55,
			south: -9.57,
			east: -35.76,
			west: -35.78,
		};
	}

	let north = -90;
	let south = 90;
	let east = -180;
	let west = 180;

	for (const [lng, lat] of coordinates) {
		if (lat > north) north = lat;
		if (lat < south) south = lat;
		if (lng > east) east = lng;
		if (lng < west) west = lng;
	}

	// Add padding in degrees (approximate: 1° lat ≈ 111km, 1° lng ≈ 111km * cos(lat))
	const latPadding = paddingMeters / 111_000;
	const lngPadding =
		paddingMeters /
		(111_000 * Math.cos(((north + south) / 2) * (Math.PI / 180)));

	return {
		north: north + latPadding,
		south: south - latPadding,
		east: east + lngPadding,
		west: west - lngPadding,
	};
}

/**
 * Convert Bounds to fitBounds config for react-map-gl / maplibre.
 */
export function boundsToPaddingBox(
	bounds: Bounds,
	padding: number,
): {
	bounds: [[number, number], [number, number]];
	padding: number;
} {
	return {
		bounds: [
			[bounds.west, bounds.south] as [number, number],
			[bounds.east, bounds.north] as [number, number],
		],
		padding,
	};
}

// ─── Place ↔ LngLat converters ───────────────────────────────────────────────

export function placeToLngLat(place: Place): LngLat {
	return [place.longitude, place.latitude];
}

export function placeToLatLng(place: Place): LatLng {
	return { latitude: place.latitude, longitude: place.longitude };
}
