/**
 * Ramer-Douglas-Peucker line simplification algorithm.
 *
 * Reduces the number of points in a polyline while preserving its shape.
 * Typical epsilon values for GPS tracks: 5–10 meters.
 *
 * @param points - Array of [longitude, latitude, unix_timestamp_ms]
 * @param epsilonMeters - Maximum distance (meters) a point can deviate from the simplified line
 * @returns Simplified array of points
 */
export function simplifyRDP(
	points: Array<[number, number, number]>,
	epsilonMeters: number = 8,
): Array<[number, number, number]> {
	if (points.length <= 2) return points;

	// Safe to assert non-null: length > 2 is checked above
	const first = points[0] as [number, number, number];
	const last = points[points.length - 1] as [number, number, number];
	const firstLatLng = latLngFromCoord(first);
	const lastLatLng = latLngFromCoord(last);

	// Find the point with the maximum distance from the line segment
	let maxDistance = 0;
	let maxIndex = 0;

	for (let i = 1; i < points.length - 1; i++) {
		const pt = points[i] as [number, number, number];
		const point = latLngFromCoord(pt);
		const d = perpendicularDistance(point, firstLatLng, lastLatLng);
		if (d > maxDistance) {
			maxDistance = d;
			maxIndex = i;
		}
	}

	// If max distance is greater than epsilon, recursively simplify
	if (maxDistance > epsilonMeters) {
		const left = simplifyRDP(points.slice(0, maxIndex + 1), epsilonMeters);
		const right = simplifyRDP(points.slice(maxIndex), epsilonMeters);

		// Concatenate, excluding the duplicate endpoint
		return [...left.slice(0, -1), ...right];
	}

	// Return just the first and last points
	return [first, last];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface LatLng {
	latitude: number;
	longitude: number;
}

function latLngFromCoord(coord: [number, number, number]): LatLng {
	return { longitude: coord[0], latitude: coord[1] };
}

/**
 * Perpendicular distance from a point to a line segment defined by two points.
 * Uses flat Cartesian approximation, accurate enough for small areas (campus-scale).
 */
function perpendicularDistance(point: LatLng, a: LatLng, b: LatLng): number {
	const R = 6_371_000;
	const toRad = (deg: number) => (deg * Math.PI) / 180;

	const latRad = toRad(point.latitude);
	const lngRad = toRad(point.longitude);

	// Convert to flat meters (approximate)
	const cosLat = Math.cos(latRad);

	const px = R * lngRad * cosLat;
	const py = R * latRad;

	const ax = R * toRad(a.longitude) * cosLat;
	const ay = R * toRad(a.latitude);

	const bx = R * toRad(b.longitude) * cosLat;
	const by = R * toRad(b.latitude);

	const apx = px - ax;
	const apy = py - ay;
	const abx = bx - ax;
	const aby = by - ay;

	const dot = apx * abx + apy * aby;
	const lenSq = abx * abx + aby * aby;
	const t = lenSq !== 0 ? Math.max(0, Math.min(1, dot / lenSq)) : 0;

	const closestX = ax + t * abx;
	const closestY = ay + t * aby;

	const dx = px - closestX;
	const dy = py - closestY;

	return Math.sqrt(dx * dx + dy * dy);
}
