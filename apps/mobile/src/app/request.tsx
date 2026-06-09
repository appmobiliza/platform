import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MapView from "@/components/map/map-view";
import { RequestFlowSheet } from "@/components/request-flow-sheet";
import type { Place } from "@/components/request-flow-sheet/types";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useScholarPositions } from "@/hooks/use-scholar-positions";
import { useScholarTripPosition } from "@/hooks/use-scholar-trip-position";
import {
	getCachedCampusLocations,
	setNearestPoint,
} from "@/lib/location-store";
import { findNearestCampusLocation } from "@/lib/map-utils";
import { fetchOSRMRoute, formatDuration } from "@/lib/osrm";
import { useRequestState } from "@/lib/request-store";

const BACK_ALLOWED_DESTINATIONS = [
	"destination",
	"route-selection",
	"start-confirm",
];

export default function RequestScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	// ─── Current request state ──────────────────────────────────────────────

	const {
		stage,
		searchState,
		origin,
		destination,
		activeRequestId,
		isOngoing,
	} = useRequestState();

	// ─── Campus locations for nearest-point detection ───────────────────────

	const campusLocationItems = useMemo(
		() =>
			getCachedCampusLocations().map((loc) => ({
				name: loc.name,
				latitude: loc.latitude,
				longitude: loc.longitude,
				abbreviation: loc.abbreviation ?? undefined,
			})),
		[],
	);

	// ─── Scholar real-time positions (searching stage) ──────────────────────

	const { scholarPositions: allScholarPositions } = useScholarPositions({
		enabled: stage === "searching" && searchState === "searching",
		channelPrefix: "scholar",
		positionEvent: "position",
		offlineEvent: "offline",
	});

	// ─── Specific scholar position (trip stage) ─────────────────────────────

	const { scholarPosition } = useScholarTripPosition({
		enabled: stage === "trip",
		requestId: activeRequestId,
		positionEvent: "request:position",
	});

	// ─── User location (for trip routes) ────────────────────────────────────

	const [userLocation, setUserLocation] = useState<{
		latitude: number;
		longitude: number;
	} | null>(null);

	useEffect(() => {
		if (stage !== "trip") {
			setUserLocation(null);
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
					timeInterval: 5000,
					distanceInterval: 10,
				},
				(newLocation) => {
					if (!cancelled) {
						setUserLocation({
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
	}, [stage]);

	// ─── Route path for map (OSRM) ────────────────────────────────────────

	const [routePath, setRoutePath] = useState<
		Array<[number, number]> | undefined
	>(undefined);
	const [scholarDistance, setScholarDistance] = useState<string | null>(null);

	useEffect(() => {
		if (stage !== "trip") {
			setRoutePath(undefined);
			setScholarDistance(null);
			return;
		}

		let cancelled = false;

		const computeRoute = async () => {
			if (!isOngoing && scholarPosition && origin) {
				// Not ongoing → route from scholar to origin
				const result = await fetchOSRMRoute(
					[scholarPosition.longitude, scholarPosition.latitude],
					[origin.longitude, origin.latitude],
					"foot",
				);

				if (cancelled) return;

				if (result) {
					setRoutePath(
						result.geometry.coordinates as Array<[number, number]>,
					);
					setScholarDistance(formatDuration(result.duration));
				} else {
					setRoutePath(undefined);
					setScholarDistance(null);
				}
			} else if (isOngoing && destination) {
				// Ongoing → route from user/origin to destination
				const from = userLocation
					? [userLocation.longitude, userLocation.latitude]
					: origin
						? [origin.longitude, origin.latitude]
						: null;

				if (from) {
					const result = await fetchOSRMRoute(
						from as [number, number],
						[destination.longitude, destination.latitude],
						"foot",
					);

					if (cancelled) return;

					if (result) {
						setRoutePath(
							result.geometry.coordinates as Array<
								[number, number]
							>,
						);
					} else {
						setRoutePath(undefined);
					}
				}
			} else {
				setRoutePath(undefined);
				setScholarDistance(null);
			}
		};

		computeRoute();

		// Re-fetch every 30 seconds
		const interval = setInterval(computeRoute, 30_000);

		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, [stage, isOngoing, scholarPosition, origin, destination, userLocation]);

	// ─── Destination mode: find nearest point when center changes ──────────

	const handleCenterChanged = useCallback(
		(latitude: number, longitude: number) => {
			const nearest = findNearestCampusLocation(
				latitude,
				longitude,
				campusLocationItems,
			);
			if (nearest) {
				setNearestPoint({
					name: nearest.name,
					abbreviation: nearest.abbreviation,
					latitude: nearest.latitude,
					longitude: nearest.longitude,
				} as Place);
			}
		},
		[campusLocationItems],
	);

	return (
		<View className="flex-1 bg-background overflow-hidden">
			<MapView
				stage={stage}
				origin={origin}
				destination={destination}
				scholar={scholarPosition}
				scholarPositions={allScholarPositions}
				routePath={routePath}
				scholarDistance={scholarDistance}
				showCenterMarker={stage === "destination"}
				onCenterChanged={
					stage === "destination" ? handleCenterChanged : undefined
				}
			/>

			<View
				className="absolute top-0 left-0 z-10 flex-row items-start gap-4 px-4 pt-4"
				style={{
					paddingTop: insets.top + 16,
				}}
			>
				{BACK_ALLOWED_DESTINATIONS.includes(stage) && (
					<Pressable
						className="shrink-0 p-3 bg-secondary rounded-full shadow-sm shadow-secondary/20 mt-4"
						onPress={() => router.back()}
					>
						<Icon icon={ArrowLeft} size={24} color="--foreground" />
					</Pressable>
				)}
				<View className="min-w-0 flex-1 gap-1 items-start justify-start">
					<Text
						variant={"h1"}
						className="text-foreground text-left"
						numberOfLines={2}
					>
						Campus A.C Simões
					</Text>
				</View>
			</View>

			<RequestFlowSheet scholarPosition={scholarPosition} />
		</View>
	);
}
