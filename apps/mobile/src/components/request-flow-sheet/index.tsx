import { View } from "react-native";

import { useAppColorScheme } from "@/lib/use-app-color-scheme";

import {
	DestinationSelectionStage,
	DestinationStage,
	SearchingStage,
	StartConfirmStage,
	TripStage,
} from "./stages";
import { useRequestFlow } from "./use-request-flow";

function RequestFlowSheet() {
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
			/>

			<DestinationSelectionStage
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
				dismissAndExit={dismissAndExit}
			/>
		</View>
	);
}

export { RequestFlowSheet };
