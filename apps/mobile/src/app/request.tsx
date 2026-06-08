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

import { useScholarPositions } from "@/hooks/use-scholar-positions";
import { useScholarTripPosition } from "@/hooks/use-scholar-trip-position";
import { setNearestPoint } from "@/lib/location-store";
import { findNearestCampusLocation } from "@/lib/map-utils";
import { useRequestState } from "@/lib/request-store";
import { trpc } from "@/lib/trpc/client";

export default function RequestScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	// ─── Current request state ──────────────────────────────────────────────

	const { stage, searchState, origin, destination, activeRequestId } =
		useRequestState();

	// ─── Campus locations for nearest-point detection ───────────────────────

	const { data: campusLocations = [] } = trpc.locations.list.useQuery();

	const campusLocationItems = useMemo(
		() =>
			campusLocations.map((loc) => ({
				name: loc.name,
				latitude: loc.latitude,
				longitude: loc.longitude,
				abbreviation: loc.abbreviation ?? undefined,
			})),
		[campusLocations],
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

	// ─── Campus name in header ─────────────────────────────────────────────

	const campusName =
		origin?.name?.split(",")[0] ??
		destination?.name?.split(",")[0] ??
		"Campus A.C Simões";

	return (
		<View className="flex-1 bg-background overflow-hidden">
			<MapView
				stage={stage}
				origin={origin}
				destination={destination}
				scholar={scholarPosition}
				scholarPositions={allScholarPositions}
				showCenterMarker={stage === "destination"}
				onCenterChanged={
					stage === "destination" ? handleCenterChanged : undefined
				}
			/>

			<View
				className="absolute top-0 left-0 z-10 flex-row items-start gap-4 px-4 pt-4"
				style={{
					paddingTop: insets.top + 24,
				}}
			>
				<Pressable
					className="shrink-0 p-3 bg-secondary rounded-full shadow-sm shadow-secondary/20 mt-4"
					onPress={() => router.back()}
				>
					<Icon icon={ArrowLeft} size={24} color="--foreground" />
				</Pressable>
				<View className="min-w-0 flex-1 gap-1 items-start justify-start">
					<Text
						variant={"h1"}
						className="text-foreground text-left"
						numberOfLines={2}
					>
						{campusName}
					</Text>
				</View>
			</View>

			<RequestFlowSheet />
		</View>
	);
}
