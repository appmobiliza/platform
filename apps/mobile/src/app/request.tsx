import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MapView from "@/components/map/map-view";
import { RequestFlowSheet } from "@/components/request-flow-sheet";
import type { Place } from "@/components/request-flow-sheet/types";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useOsrmRoute } from "@/hooks/use-osrm-route";
import { usePositionBroadcaster } from "@/hooks/use-position-broadcaster";
import { useScholarPositions } from "@/hooks/use-scholar-positions";
import { useScholarTripPosition } from "@/hooks/use-scholar-trip-position";
import { useUserLocation } from "@/hooks/use-user-location";
import { haversineMeters } from "@/lib/distance";
import {
	getCachedCampusLocations,
	setNearestPoint,
} from "@/lib/location-store";
import { findNearestCampusLocation } from "@/lib/map-utils";
import { formatDuration } from "@/lib/osrm";
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

	const userLocation = useUserLocation({ enabled: stage === "trip" });

	// ─── Broadcast student position to scholar during trip ───────────────────
	usePositionBroadcaster({
		enabled: stage === "trip",
		location: userLocation,
		requestId: activeRequestId,
	});

	// ── Distance from user to origin ───────────────────────────────────────

	const distanceToOrigin = useMemo(() => {
		if (!userLocation || !origin) return null;
		return haversineMeters(
			userLocation.latitude,
			userLocation.longitude,
			origin.latitude,
			origin.longitude,
		);
	}, [userLocation, origin]);

	const isFarFromOrigin =
		distanceToOrigin !== null && distanceToOrigin > 1000;

	console.log("[RequestScreen] Trip state", {
		stage,
		isOngoing,
		isFarFromOrigin,
		distanceToOrigin,
		userLocation,
		origin: origin ? { lat: origin.latitude, lng: origin.longitude } : null,
		destination: destination
			? { lat: destination.latitude, lng: destination.longitude }
			: null,
		scholarPosition: scholarPosition
			? { lat: scholarPosition.latitude, lng: scholarPosition.longitude }
			: null,
	});

	// ─── Route path for map (OSRM) ────────────────────────────────────────

	const { route: osrmRoute } = useOsrmRoute({
		origin:
			!isOngoing && isFarFromOrigin && userLocation
				? [userLocation.longitude, userLocation.latitude]
				: !isOngoing && scholarPosition
					? ([
							scholarPosition.longitude,
							scholarPosition.latitude,
						] as [number, number])
					: isOngoing && userLocation
						? [userLocation.longitude, userLocation.latitude]
						: isOngoing && origin
							? [origin.longitude, origin.latitude]
							: null,
		destination:
			!isOngoing && origin
				? [origin.longitude, origin.latitude]
				: isOngoing && destination
					? [destination.longitude, destination.latitude]
					: null,
		enabled:
			stage === "trip" &&
			((!isOngoing && isFarFromOrigin && !!userLocation && !!origin) ||
				(!isOngoing &&
					!isFarFromOrigin &&
					!!scholarPosition &&
					!!origin) ||
				(isOngoing && !!destination)),
	});

	// Route path: prefer OSRM route, fallback to a meaningful straight line
	// so the map never shows origin→destination when we need user→origin.
	const routePath = useMemo<Array<[number, number]> | undefined>(() => {
		let path: Array<[number, number]> | undefined;

		if (osrmRoute?.geometry?.coordinates?.length >= 2) {
			path = osrmRoute.geometry.coordinates as Array<[number, number]>;
			console.log(
				"[RequestScreen] routePath: using OSRM route (",
				path.length,
				" points)",
			);
		} else if (!isOngoing && isFarFromOrigin && userLocation && origin) {
			path = [
				[userLocation.longitude, userLocation.latitude],
				[origin.longitude, origin.latitude],
			];
			console.log("[RequestScreen] routePath: fallback user→origin");
		} else if (!isOngoing && !isFarFromOrigin && origin && destination) {
			path = [
				[origin.longitude, origin.latitude],
				[destination.longitude, destination.latitude],
			];
			console.log(
				"[RequestScreen] routePath: fallback origin→destination",
			);
		} else if (isOngoing && userLocation && destination) {
			path = [
				[userLocation.longitude, userLocation.latitude],
				[destination.longitude, destination.latitude],
			];
			console.log("[RequestScreen] routePath: fallback user→destination");
		} else {
			console.log("[RequestScreen] routePath: none —", {
				isOngoing,
				isFarFromOrigin,
				hasUser: !!userLocation,
				hasOrigin: !!origin,
				hasDest: !!destination,
			});
		}

		return path;
	}, [
		osrmRoute,
		isOngoing,
		isFarFromOrigin,
		userLocation,
		origin,
		destination,
	]);

	// Scholar distance badge (separate from main route when showing user→origin)
	const scholarDistance = useMemo<string | null>(() => {
		if (!isOngoing && osrmRoute && !isFarFromOrigin) {
			// Main route is scholar→origin, use its duration
			return formatDuration(osrmRoute.duration);
		}
		// Fallback: straight-line distance / walking speed
		if (!isOngoing && scholarPosition && origin) {
			const distance = haversineMeters(
				scholarPosition.latitude,
				scholarPosition.longitude,
				origin.latitude,
				origin.longitude,
			);
			return formatDuration(distance / 1.4);
		}
		return null;
	}, [isOngoing, osrmRoute, isFarFromOrigin, scholarPosition, origin]);

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
