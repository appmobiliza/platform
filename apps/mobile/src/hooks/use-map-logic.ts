import { useEffect, useState } from "react";

// GeoJSON de uma rota simples entre dois pontos
function buildRouteGeoJSON(
	origin: [number, number],
	destination: [number, number],
) {
	return {
		type: "Feature" as const,
		geometry: {
			type: "LineString" as const,
			coordinates: [origin, destination],
		},
	};
}

function calculateDistance(a: [number, number], b: [number, number]): string {
	const R = 6371e3;
	const φ1 = (a[1] * Math.PI) / 180;
	const φ2 = (b[1] * Math.PI) / 180;
	const Δφ = ((b[1] - a[1]) * Math.PI) / 180;
	const Δλ = ((b[0] - a[0]) * Math.PI) / 180;
	const x =
		Math.sin(Δφ / 2) ** 2 +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
	const metros = 2 * R * Math.asin(Math.sqrt(x));
	return metros < 1000
		? `${Math.round(metros)}m`
		: `${(metros / 1000).toFixed(1)}km`;
}

export function useMapLogic(participant: {
	destinationCoords: [number, number];
}) {
	const [currentPosition, setCurrentPosition] = useState<
		[number, number] | null
	>(null);
	const [route, setRoute] = useState<object | null>(null);
	const [distance, setDistance] = useState<string>("--");

	useEffect(() => {
		const watchId = navigator.geolocation.watchPosition(
			({ coords }) => {
				const pos: [number, number] = [
					coords.longitude,
					coords.latitude,
				];
				setCurrentPosition(pos);
				setRoute(buildRouteGeoJSON(pos, participant.destinationCoords));
				setDistance(
					calculateDistance(pos, participant.destinationCoords),
				);
			},
			(err) => console.warn("Geolocation error:", err),
			{ enableHighAccuracy: true },
		);

		return () => navigator.geolocation.clearWatch(watchId);
	}, [participant.destinationCoords]);

	return { currentPosition, route, distance };
}
