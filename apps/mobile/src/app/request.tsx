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
import { useScholarPositions } from "@/hooks/use-scholar-positions";
import { useScholarTripPosition } from "@/hooks/use-scholar-trip-position";
import { useUserLocation } from "@/hooks/use-user-location";
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

	// ─── Route path for map (OSRM) ────────────────────────────────────────

	const { route: osrmRoute } = useOsrmRoute({
		origin:
			!isOngoing && scholarPosition
				? ([scholarPosition.longitude, scholarPosition.latitude] as [
						number,
						number,
					])
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
			((!isOngoing && !!scholarPosition && !!origin) ||
				(isOngoing && !!destination)),
	});

	const routePath: Array<[number, number]> | undefined = osrmRoute?.geometry
		.coordinates as Array<[number, number]> | undefined;

	const scholarDistance =
		!isOngoing && osrmRoute ? formatDuration(osrmRoute.duration) : null;

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
