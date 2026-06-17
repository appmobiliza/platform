// OSRM routing utility — fetches routes from OpenStreetMap data
// Uses the foot profile for walking routes on campus

export interface OSRMResult {
	geometry: GeoJSON.LineString;
	distance: number; // meters
	duration: number; // seconds
}

export type OSRMProfile = "foot" | "bike" | "car";

/**
 * Fetch a route between two points using the OSRM public API.
 *
 * @param origin - [longitude, latitude]
 * @param destination - [longitude, latitude]
 * @param profile - routing profile (default: "foot")
 * @returns Route geometry, distance, and duration, or null on failure
 */
export async function fetchOSRMRoute(
	origin: [number, number],
	destination: [number, number],
	profile: OSRMProfile = "foot",
): Promise<OSRMResult | null> {
	const url = `https://router.project-osrm.org/route/v1/${profile}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&overview=full`;

	console.log("[OSRM] Fetching route", { origin, destination, profile, url });

	try {
		const res = await fetch(url);
		const data = await res.json();

		console.log("[OSRM] Response code:", data.code, "| routes:", data.routes?.length);

		if (data.code !== "Ok" || !data.routes?.[0]) {
			console.warn("[OSRM] No valid route returned", { code: data.code });
			return null;
		}

		const route = data.routes[0] as {
			geometry: GeoJSON.LineString;
			distance: number;
			duration: number;
		};

		console.log("[OSRM] Route success — coord count:", route.geometry.coordinates.length, "| distance:", route.distance, "| duration:", route.duration);

		return {
			geometry: route.geometry,
			distance: route.distance,
			duration: route.duration,
		};
	} catch (err) {
		console.warn("[OSRM] Fetch failed:", err);
		return null;
	}
}

/**
 * Format a duration in seconds into a concise string.
 * Examples: "2 min", "15 min", "1h 05min"
 */
export function formatDuration(seconds: number): string {
	if (seconds < 60) {
		return `${Math.round(seconds)}s`;
	}

	const minutes = Math.round(seconds / 60);
	if (minutes < 60) {
		return `${minutes} min`;
	}

	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}min`;
}

/**
 * Format an arrival time given a duration in seconds.
 * Returns e.g. "Chegada às 09:35"
 */
export function formatArrivalTime(durationSeconds: number): string {
	const now = new Date();
	const arrival = new Date(now.getTime() + durationSeconds * 1000);
	const hours = arrival.getHours().toString().padStart(2, "0");
	const minutes = arrival.getMinutes().toString().padStart(2, "0");
	return `${hours}:${minutes}`;
}
