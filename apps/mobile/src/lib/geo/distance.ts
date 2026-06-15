// distance.ts — shared geo/distance utilities

export type LatLng = { latitude: number; longitude: number };

/** Haversine distance in meters between two lat/lng coordinates. */
export function haversineMeters(
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
	const x =
		Math.sin(Δφ / 2) ** 2 +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(x));
}

/** Haversine distance in meters between two points with {latitude, longitude}. */
export function haversineDistance(a: LatLng, b: LatLng): number {
	return haversineMeters(a.latitude, a.longitude, b.latitude, b.longitude);
}

/** Convert lat/lng to flat Cartesian meters (approximate, fine for small areas). */
function toMetersCoords(lat: number, lng: number) {
	const R = 6_371_000;
	const latRad = (lat * Math.PI) / 180;
	const lngRad = (lng * Math.PI) / 180;
	return {
		x: R * lngRad * Math.cos(latRad),
		y: R * latRad,
	};
}

/** Shortest distance (m) from `point` to the line segment `a`–`b`. */
export function pointToLineDistance(point: LatLng, a: LatLng, b: LatLng): number {
	const P = toMetersCoords(point.latitude, point.longitude);
	const A = toMetersCoords(a.latitude, a.longitude);
	const B = toMetersCoords(b.latitude, b.longitude);

	const APx = P.x - A.x;
	const APy = P.y - A.y;
	const ABx = B.x - A.x;
	const ABy = B.y - A.y;

	const dot = APx * ABx + APy * ABy;
	const lenSq = ABx * ABx + ABy * ABy;
	let t = lenSq !== 0 ? dot / lenSq : -1;
	t = Math.max(0, Math.min(1, t));

	const closestX = A.x + t * ABx;
	const closestY = A.y + t * ABy;

	const dx = P.x - closestX;
	const dy = P.y - closestY;
	return Math.sqrt(dx * dx + dy * dy);
}

/** Format meters to a human-readable string (e.g. `"350m"` or `"1.2km"`). */
export function formatDistance(meters: number): string {
	if (meters < 1_000) {
		return `${Math.round(meters)}m`;
	}
	return `${(meters / 1_000).toFixed(1)}km`;
}
