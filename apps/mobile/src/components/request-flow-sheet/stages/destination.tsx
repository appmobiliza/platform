import { MapPin, Search } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useNearestPoint } from "@/lib/location-store";
import { cn } from "@/lib/utils";

import { SheetFrame, StageSheet } from "../subcomponents/layout";
import type { Place, Stage } from "../types";
import type { StageBaseProps } from "./types";

interface DestinationStageProps extends StageBaseProps {
	transitionTo: (stage: Stage) => void;
	setDestination: (place: Place) => void;
}

function DestinationStage({
	modalRef,
	handleDismiss,
	isDark,
	destination,
	transitionTo,
	setDestination,
}: DestinationStageProps) {
	// Watch the nearest point set by the page-level map (request.tsx)
	const nearestPoint = useNearestPoint();

	// Tracks whether we've skipped the initial mount application.
	// Without this guard, the home screen's nearest-point would
	// pre-fill the destination before the user interacts.
	const hasAppliedInitial = useRef(false);

	// Auto-set destination when user pans the page-level map
	useEffect(() => {
		if (!hasAppliedInitial.current) {
			hasAppliedInitial.current = true;
			return;
		}

		if (nearestPoint && nearestPoint.name !== destination?.name) {
			setDestination(nearestPoint);
		}
	}, [nearestPoint, setDestination, destination?.name]);

	return (
		<StageSheet
			stage="destination"
			modalRef={modalRef}
			onDismiss={handleDismiss}
			colorScheme={isDark ? "dark" : "light"}
		>
			<SheetFrame
				title="Insira seu destino"
				description="Arraste o mapa para mover o marcador"
				headerPosition="center"
				footer={
					<Button onPress={() => transitionTo("route-selection")}>
						<Text>
							{destination ? "Confirmar" : "Selecionar"} destino
						</Text>
					</Button>
				}
				shouldWrapChildren
			>
				<Pressable
					className={cn(
						"justify-between px-3 dark:bg-input/50 border-border dark:border-input flex w-full min-w-0 flex-row items-center rounded-md border py-1 text-base text-foreground shadow-sm shadow-black/5 sm:h-9 pl-3",
					)}
					onPress={() => transitionTo("route-selection")}
				>
					<View className="gap-4 flex-row items-center justify-start flex-1">
						<Icon
							icon={MapPin}
							size={20}
							color="--muted-foreground"
						/>
						<Text className="flex-1">
							{destination?.name ?? "Digite um destino"}
						</Text>
					</View>
					<Icon icon={Search} size={20} color="--muted-foreground" />
				</Pressable>
			</SheetFrame>
		</StageSheet>
	);
}

export { DestinationStage };
