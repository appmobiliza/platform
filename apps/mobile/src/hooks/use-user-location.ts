import * as Location from "expo-location";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Coordinates {
	latitude: number;
	longitude: number;
}

export interface UseUserLocationOptions {
	/** Whether location tracking is enabled. Default: true */
	enabled?: boolean;
	/** Minimum time between updates (ms). Default: 5000 */
	timeInterval?: number;
	/** Minimum distance between updates (meters). Default: 10 */
	distanceInterval?: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Track the user's current geographic position using the device GPS.
 *
 * Requests foreground permission if not yet granted and watches position
 * with the configured accuracy and interval.
 */
export function useUserLocation({
	enabled = true,
	timeInterval = 5000,
	distanceInterval = 10,
}: UseUserLocationOptions = {}): Coordinates | null {
	const [location, setLocation] = useState<Coordinates | null>(null);

	useEffect(() => {
		if (!enabled) {
			setLocation(null);
			return;
		}

		let subscription: Location.LocationSubscription | null = null;
		let cancelled = false;

		const startWatching = async () => {
			const { status } =
				await Location.requestForegroundPermissionsAsync();
			if (status !== "granted" || cancelled) return;

			subscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval,
					distanceInterval,
				},
				(newLocation) => {
					if (!cancelled) {
						setLocation({
							latitude: newLocation.coords.latitude,
							longitude: newLocation.coords.longitude,
						});
					}
				},
			);
		};

		startWatching();

		return () => {
			cancelled = true;
			if (subscription) {
				subscription.remove();
			}
		};
	}, [enabled, timeInterval, distanceInterval]);

	return location;
}
