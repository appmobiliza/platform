import * as Location from "expo-location";
import * as React from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

import { ufalPoints } from "@/constants/locations";

import type { Place, Stage } from "./types";
import { useEffect } from "react";

function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371e3;
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lon2 - lon1) * Math.PI) / 180;
	const x =
		Math.sin(Δφ / 2) ** 2 +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(x));
}

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

	React.useEffect(() => {
		async function setOriginFromLocation() {
			try {
				const { status } =
					await Location.getForegroundPermissionsAsync();
				if (status !== "granted") {
					return;
				}

				if (ufalPoints.length === 0) {
					return;
				}

				const position = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
				});

				const userLat = position.coords.latitude;
				const userLng = position.coords.longitude;

				let closestPoint = ufalPoints[0]!;
				let minDistance = calculateDistance(
					userLat,
					userLng,
					closestPoint.latitude,
					closestPoint.longitude,
				);

				for (let i = 1; i < ufalPoints.length; i++) {
					const point = ufalPoints[i];
					if (!point) continue;
					const dist = calculateDistance(
						userLat,
						userLng,
						point.latitude,
						point.longitude,
					);
					if (dist < minDistance) {
						minDistance = dist;
						closestPoint = point;
					}
				}

				setOrigin({
					name: closestPoint.name,
					abbreviation: closestPoint.abbrev,
					latitude: closestPoint.latitude,
					longitude: closestPoint.longitude,
				});
			} catch (error) {
				console.warn(
					"Failed to get current location for origin:",
					error,
				);
			}
		}

		setOriginFromLocation();
	}, []);

	useEffect(() => {
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
