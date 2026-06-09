import { getCurrentShift, scholarShiftLabels } from "@mobiliza/contracts";

import { useMemo } from "react";
import { View } from "react-native";

import { AddressRoute } from "@/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { useOsrmRoute } from "@/hooks/use-osrm-route";
import { useUserLocation } from "@/hooks/use-user-location";
import { formatShortDate } from "@/lib/date";
import { haversineMeters } from "@/lib/distance";
import type { ScholarPosition } from "@/lib/map-utils";
import { formatArrivalTime, formatDuration } from "@/lib/osrm";
import type { ScholarInfo } from "@/lib/request-store";

import { SheetFrame, StageSheet } from "../subcomponents/layout";
import type { StageBaseProps } from "./types";

interface TripStageProps extends StageBaseProps {
	scholarInfo: ScholarInfo | null;
	isOngoing: boolean;
	scholarPosition?: ScholarPosition | null;
}

function getDisplayShift(scholar: ScholarInfo | null): string {
	// Usa o turno informado no payload, ou fallback para o turno atual baseado no horário
	const shift = scholar?.shift ?? getCurrentShift();
	return scholarShiftLabels[shift as keyof typeof scholarShiftLabels];
}

// ─── Component ───────────────────────────────────────────────────────────────────

function TripStage({
	modalRef,
	handleDismiss,
	isDark,
	origin,
	destination,
	scholarInfo,
	isOngoing,
	scholarPosition,
	dismissAndExit,
}: TripStageProps) {
	const userLocation = useUserLocation();

	// ── Compute distance from user to origin ───────────────────────────────

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

	// ── Scholar ETA (route from scholar to origin) ────────────────────────

	const { route: scholarRoute } = useOsrmRoute({
		origin: scholarPosition
			? [scholarPosition.longitude, scholarPosition.latitude]
			: null,
		destination: origin ? [origin.longitude, origin.latitude] : null,
		enabled: !isOngoing && !!scholarPosition && !!origin,
	});

	const scholarEta = useMemo<string | null>(() => {
		if (scholarRoute) return formatDuration(scholarRoute.duration);

		// Fallback when OSRM fails: straight-line distance / walking speed
		if (scholarPosition && origin && !isOngoing) {
			const distance = haversineMeters(
				scholarPosition.latitude,
				scholarPosition.longitude,
				origin.latitude,
				origin.longitude,
			);
			return formatDuration(distance / 1.4);
		}

		return null;
	}, [scholarRoute, scholarPosition, origin, isOngoing]);

	// ── Destination ETA (route from user/origin to destination) ───────────

	const destFrom = useMemo<[number, number] | null>(() => {
		if (userLocation)
			return [userLocation.longitude, userLocation.latitude];
		if (origin) return [origin.longitude, origin.latitude];
		return null;
	}, [userLocation, origin]);

	const { route: destinationRoute } = useOsrmRoute({
		origin: destFrom,
		destination: destination
			? [destination.longitude, destination.latitude]
			: null,
		enabled: isOngoing && !!destFrom && !!destination,
	});

	const destinationEta = useMemo<string | null>(() => {
		if (destinationRoute)
			return formatArrivalTime(destinationRoute.duration);

		// Fallback when OSRM fails
		if (destFrom && destination && isOngoing) {
			const distance = haversineMeters(
				destFrom[1],
				destFrom[0],
				destination.latitude,
				destination.longitude,
			);
			return formatArrivalTime(distance / 1.4);
		}

		return null;
	}, [destinationRoute, destFrom, destination, isOngoing]);

	// ── Derive title / description / accessory ────────────────────────────

	let title: string;
	let description: string;
	let accessory: React.ReactNode = null;

	if (isOngoing) {
		title = "Em direção ao destino";
		description = destination?.name ?? "";

		if (destinationEta) {
			accessory = (
				<View className="bg-primary rounded-md px-3 py-1.5">
					<Text className="text-primary-foreground text-sm font-semibold">
						{destinationEta}
					</Text>
				</View>
			);
		}
	} else if (isFarFromOrigin) {
		// User is far from origin → ask them to go to the pickup point
		title = "Vá até o ponto de partida";
		description = `${origin?.abbreviation ? `${origin?.abbreviation} - ` : ""}${origin?.name ?? ""}`;
	} else {
		// User is near the origin → wait for the scholar
		title = `${scholarInfo?.name ?? "Contribuinte"} está a caminho`;
		description = "Aguarde no ponto de partida";

		if (scholarEta) {
			accessory = (
				<View className="bg-primary rounded-md px-3 py-1.5">
					<Text className="text-primary-foreground text-sm font-semibold">
						{scholarEta}
					</Text>
				</View>
			);
		}
	}

	return (
		<StageSheet
			stage="trip"
			modalRef={modalRef}
			onDismiss={handleDismiss}
			colorScheme={isDark ? "dark" : "light"}
		>
			<SheetFrame
				title={title}
				description={description}
				accessory={accessory}
				shouldWrapChildren
				footer={
					<Button variant="destructive" onPress={dismissAndExit}>
						<Text>Cancelar deslocamento</Text>
					</Button>
				}
			>
				<View className="gap-4 rounded-md border border-border bg-card px-4 py-4">
					<View className="flex-row items-start gap-4">
						<Avatar
							alt="Avatar do contribuinte"
							className="size-12"
						>
							{scholarInfo?.image ? (
								<AvatarImage
									source={{
										uri: scholarInfo.image,
									}}
								/>
							) : null}
							<AvatarFallback>
								<Text>
									{scholarInfo?.name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.slice(0, 2)
										.toUpperCase() ?? ""}
								</Text>
							</AvatarFallback>
						</Avatar>
						<View className="flex-1 gap-0.5">
							<View className="flex-row items-center justify-between gap-3">
								<Text className="text-[16px] font-semibold leading-6 text-foreground">
									{scholarInfo?.name ?? "Contribuinte"}
								</Text>
								<Text className="text-[14px] leading-5 text-muted-foreground">
									{scholarInfo?.createdAt
										? `desde ${formatShortDate(scholarInfo.createdAt)}`
										: ""}
								</Text>
							</View>
							<Badge variant={"secondary"}>
								<Text>{getDisplayShift(scholarInfo)}</Text>
							</Badge>
						</View>
					</View>
				</View>

				<Text className="text-sm font-semibold leading-6 text-foreground">
					TRAJETO
				</Text>

				<AddressRoute
					className="bg-input p-4 rounded-lg"
					from={{
						label: origin?.abbreviation ?? origin?.name ?? "",
					}}
					to={{
						label: destination?.name ?? "",
					}}
					maxLines={2}
					shouldShowRoute
				/>
			</SheetFrame>
		</StageSheet>
	);
}

export { TripStage };
