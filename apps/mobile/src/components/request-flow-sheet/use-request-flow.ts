import * as React from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

import { getNearestPoint } from "@/lib/location-store";

import type { Place, Stage } from "./types";


function useRequestFlow() {
	const router = useRouter();

	const destinationRef = React.useRef<BottomSheetModal>(null);
	const destinationSelectionRef = React.useRef<BottomSheetModal>(null);
	const startConfirmRef = React.useRef<BottomSheetModal>(null);
	const searchingRef = React.useRef<BottomSheetModal>(null);
	const tripRef = React.useRef<BottomSheetModal>(null);

	const refs = {
		destination: destinationRef,
		"destination-selection": destinationSelectionRef,
		"start-confirm": startConfirmRef,
		searching: searchingRef,
		trip: tripRef,
	} as const satisfies Record<
		Stage,
		React.RefObject<BottomSheetModal | null>
	>;

	const activeStageRef = React.useRef<Stage>("destination-selection");
	const queuedStageRef = React.useRef<Stage | null>(null);
	const [activeStage, setActiveStage] = React.useState<Stage>(
		"destination-selection",
	);

	const [origin, setOrigin] = React.useState<Place | null>(null);
	const [destination, setDestination] = React.useState<Place | null>(null);
	const [message, setMessage] = React.useState("");

	const openStage = React.useCallback(
		(stage: Stage) => {
			activeStageRef.current = stage;
			setActiveStage(stage);
			setTimeout(() => {
				refs[stage].current?.present();
			}, 0);
		},
		[refs],
	);

	const transitionTo = React.useCallback(
		(nextStage: Stage) => {
			queuedStageRef.current = nextStage;
			refs[activeStageRef.current].current?.dismiss();
		},
		[refs],
	);

	const exitFlow = React.useCallback(() => {
		router.back();
	}, [router]);

	const dismissAndExit = React.useCallback(() => {
		queuedStageRef.current = null;
		refs[activeStageRef.current].current?.dismiss();
	}, [refs]);

	const handleDismiss = React.useCallback(
		(stage: Stage) => {
			const nextStage = queuedStageRef.current;

			if (nextStage) {
				queuedStageRef.current = null;
				activeStageRef.current = nextStage;
				setActiveStage(nextStage);
				setTimeout(() => {
					refs[nextStage].current?.present();
				}, 0);
				return;
			}

			if (stage === activeStageRef.current) {
				if (stage === "destination") {
					openStage("destination-selection");
					return;
				}

				if (stage === "destination-selection") {
					openStage("destination");
					return;
				}

				exitFlow();
			}
		},
		[exitFlow, openStage, refs],
	);

	// Initialize origin from the nearest point calculated on the Home screen
	React.useEffect(() => {
		const stored = getNearestPoint();
		if (stored) {
			setOrigin(stored);
		}
	}, []);

	React.useEffect(() => {
		openStage("destination-selection");
	}, []);

	React.useEffect(() => {
		if (activeStage !== "searching") {
			return undefined;
		}

		const timer = setTimeout(() => {
			transitionTo("trip");
		}, 1800);

		return () => clearTimeout(timer);
	}, [activeStage, transitionTo]);

	return {
		activeStage,
		destinationRef,
		destinationSelectionRef,
		destination,
		dismissAndExit,
		handleDismiss,
		message,
		origin,
		setOrigin,
		refs,
		searchingRef,
		setDestination,
		setMessage,
		startConfirmRef,
		transitionTo,
		tripRef,
	};
}

export { useRequestFlow };
