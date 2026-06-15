import { View } from "react-native";

import type { ScholarPosition } from "@/lib/geo/map-utils";
import { useAppColorScheme } from "@/lib/theme/use-app-color-scheme";

import {
	DestinationStage,
	RouteSelectionStage,
	SearchingStage,
	StartConfirmStage,
	TripStage,
} from "./stages";
import { useRequestFlow } from "./use-request-flow";

interface RequestFlowSheetProps {
	scholarPosition?: ScholarPosition | null;
}

function RequestFlowSheet({ scholarPosition }: RequestFlowSheetProps) {
	const colorScheme = useAppColorScheme();
	const isDark = colorScheme === "dark";

	const {
		campusLocationItems,
		campusLocationsByName,
		confirmRequest,
		destinationRef,
		destinationSelectionRef,
		destination,
		dismissAndExit,
		handleDismiss,
		isCreating,
		setOrigin,
		origin,
		searchingRef,
		setDestination,
		startConfirmRef,
		transitionTo,
		tripRef,
		searchState,
		elapsedSeconds,
		scholarInfo,
		isOngoing,
	} = useRequestFlow();

	return (
		<View className="absolute inset-0" pointerEvents="box-none">
			<DestinationStage
				modalRef={destinationRef}
				handleDismiss={handleDismiss}
				isDark={isDark}
				origin={origin}
				destination={destination}
				dismissAndExit={dismissAndExit}
				transitionTo={transitionTo}
				setDestination={setDestination}
			/>

			<RouteSelectionStage
				modalRef={destinationSelectionRef}
				handleDismiss={handleDismiss}
				isDark={isDark}
				destination={destination}
				origin={origin}
				campusLocationItems={campusLocationItems}
				campusLocationsByName={campusLocationsByName}
				setOrigin={setOrigin}
				setDestination={setDestination}
				transitionTo={transitionTo}
				dismissAndExit={dismissAndExit}
			/>

			<StartConfirmStage
				modalRef={startConfirmRef}
				handleDismiss={handleDismiss}
				isDark={isDark}
				origin={origin}
				destination={destination}
				confirmRequest={confirmRequest}
				isCreating={isCreating}
				transitionTo={transitionTo}
				dismissAndExit={dismissAndExit}
			/>

			<SearchingStage
				modalRef={searchingRef}
				handleDismiss={handleDismiss}
				isDark={isDark}
				searchState={searchState}
				dismissAndExit={dismissAndExit}
				origin={origin}
				destination={destination}
				elapsedSeconds={elapsedSeconds}
			/>

			<TripStage
				modalRef={tripRef}
				handleDismiss={handleDismiss}
				isDark={isDark}
				origin={origin}
				destination={destination}
				scholarInfo={scholarInfo}
				isOngoing={isOngoing}
				scholarPosition={scholarPosition}
				dismissAndExit={dismissAndExit}
			/>
		</View>
	);
}

export { RequestFlowSheet };
