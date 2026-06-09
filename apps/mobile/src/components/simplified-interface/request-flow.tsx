import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";

import { useSpeechDestination } from "@/hooks/use-speech-destination";
import { trpc } from "@/lib/trpc/client";

import type { SpeechDestinationResult } from "@/types/location";

import type { Place } from "../request-flow-sheet/types";
import {
	ConfirmStep,
	type FlowStage,
	ListeningStep,
	RequestErrorStep,
	SearchingStep,
	toCampusLocation,
	UnattendedStep,
} from "./steps";

// ─── Props ────────────────────────────────────────────────────────────────

interface AccessibleRequestFlowProps {
	campusLocations: Place[];
	nearestPoint: Place | null;
}

// ─── Main component ───────────────────────────────────────────────────────

export function AccessibleRequestFlow({
	campusLocations,
	nearestPoint,
}: AccessibleRequestFlowProps) {
	const router = useRouter();

	const [stage, setStage] = useState<FlowStage>("listening");
	const [origin, setOrigin] = useState<Place | null>(null);
	const [destination, setDestination] = useState<Place | null>(null);
	const [searchState, setSearchState] = useState<
		"idle" | "searching" | "unattended" | "error"
	>("idle");
	const [elapsedSeconds, setElapsedSeconds] = useState(0);

	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const hasStartedListening = useRef(false);

	// ─── Dependencies ────────────────────────────────────────────────────

	const createRequest = trpc.requests.create.useMutation();
	const utils = trpc.useContext();

	// Map Place[] → CampusLocation[] for the speech hook
	const campusLocationList = useMemo(
		() => campusLocations.map(toCampusLocation),
		[campusLocations],
	);

	// Quick lookup: Place name → Place (with lat/lng)
	const locationsByName = useMemo(
		() => new Map(campusLocations.map((p) => [p.name, p])),
		[campusLocations],
	);

	// Current location as CampusLocation for the speech hook
	const currentCampusLocation = useMemo(
		() => (nearestPoint ? toCampusLocation(nearestPoint) : null),
		[nearestPoint],
	);

	// ─── Speech hook ─────────────────────────────────────────────────────

	const handleSpeechResult = useCallback(
		(
			result: Pick<
				SpeechDestinationResult,
				"origin" | "destination" | "confidence"
			>,
		) => {
			if (!result.destination) return;

			const destPlace = locationsByName.get(
				result.destination.location.name,
			);
			if (destPlace) setDestination(destPlace);

			if (result.origin) {
				const origPlace = locationsByName.get(
					result.origin.location.name,
				);
				if (origPlace) setOrigin(origPlace);
			} else if (nearestPoint) {
				setOrigin(nearestPoint);
			}

			setStage("confirm");

			const destName = result.destination.location.name;
			const originName =
				result.origin?.location.name ??
				nearestPoint?.name ??
				"sua localização atual";
			AccessibilityInfo.announceForAccessibility(
				`Confirme o destino: de ${originName} para ${destName}. Toque em Sim para confirmar ou Não para tentar novamente.`,
			);
		},
		[locationsByName, nearestPoint],
	);

	const {
		phase,
		transcript,
		error: speechError,
		start,
		reset,
	} = useSpeechDestination({
		locations: campusLocationList,
		currentLocation: currentCampusLocation,
		onResult: handleSpeechResult,
	});

	// ─── Auto-start listening when stage becomes "listening" ──────────────

	const startListening = useCallback(() => {
		const t = setTimeout(() => start(), 300);
		return () => clearTimeout(t);
	}, [start]);

	useEffect(() => {
		if (stage === "listening" && !hasStartedListening.current) {
			hasStartedListening.current = true;
			return startListening();
		}
	}, [stage, startListening]);

	// ─── "Cancelar" voice command ────────────────────────────────────────

	useEffect(() => {
		if (
			stage === "listening" &&
			transcript.toLowerCase().includes("cancelar")
		) {
			reset();
			router.back();
		}
	}, [transcript, stage, reset, router]);

	// ─── Timer for searching stage ───────────────────────────────────────

	useEffect(() => {
		if (stage === "searching" && searchState === "searching") {
			timerRef.current = setInterval(() => {
				setElapsedSeconds((s) => s + 1);
			}, 1000);
			return () => {
				if (timerRef.current) clearInterval(timerRef.current);
			};
		}
	}, [stage, searchState]);

	// ─── Cleanup timer on unmount ────────────────────────────────────────

	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	// ─── Handlers ────────────────────────────────────────────────────────

	const handleConfirm = useCallback(async () => {
		if (!origin || !destination) return;

		setStage("searching");
		setSearchState("searching");
		setElapsedSeconds(0);

		AccessibilityInfo.announceForAccessibility(
			"Procurando contribuintes. Aguarde.",
		);

		try {
			const locations = await utils.locations.list.fetch();
			const map = new Map(locations.map((l) => [l.name, l.id]));
			const originId = map.get(origin.name);
			const destinationId = map.get(destination.name);

			if (!originId || !destinationId) {
				setSearchState("error");
				return;
			}

			const result = await createRequest.mutateAsync({
				originLocationId: originId,
				destinationLocationId: destinationId,
			});

			if (result.id) {
				// TODO: Subscribe to real-time events when realtime infra is integrated
				// For now, we stay on the searching screen.
			}
		} catch {
			setSearchState("error");
		}
	}, [origin, destination, createRequest, utils]);

	const handleReject = useCallback(() => {
		reset();
		setOrigin(null);
		setDestination(null);
		hasStartedListening.current = false;
		setStage("listening");
		AccessibilityInfo.announceForAccessibility(
			"Vamos tentar novamente. Diga para onde deseja ir.",
		);
	}, [reset]);

	const handleBack = useCallback(() => {
		reset();
		router.back();
	}, [reset, router]);

	const handleRetry = useCallback(() => {
		hasStartedListening.current = false;
		setStage("listening");
		AccessibilityInfo.announceForAccessibility(
			"Toque no microfone e diga para onde deseja ir.",
		);
	}, []);

	// ─── Resolve display names ───────────────────────────────────────────

	const originName = origin?.abbreviation ?? origin?.name ?? "";
	const destinationName = destination?.name ?? "";
	const confirmOriginName =
		origin?.abbreviation ?? origin?.name ?? "sua localização atual";
	const confirmDestinationName = destination?.name ?? "";

	// ─── Render current stage ───────────────────────────────────────────

	switch (stage) {
		case "listening":
			return (
				<ListeningStep
					phase={phase}
					transcript={transcript}
					speechError={speechError}
					start={start}
					onRetry={handleRetry}
					onBack={handleBack}
				/>
			);

		case "confirm":
			return (
				<ConfirmStep
					originName={confirmOriginName}
					destinationName={confirmDestinationName}
					onConfirm={handleConfirm}
					onReject={handleReject}
				/>
			);

		case "searching":
			return (
				<SearchingStep
					elapsedSeconds={elapsedSeconds}
					originName={originName}
					destinationName={destinationName}
					onCancel={handleBack}
				/>
			);

		case "unattended":
			return (
				<UnattendedStep
					originName={originName}
					destinationName={destinationName}
					onClose={handleBack}
				/>
			);

		case "request-error":
			return <RequestErrorStep onBack={handleBack} />;

		default:
			// Fallback: shouldn't normally happen
			return (
				<SearchingStep
					elapsedSeconds={elapsedSeconds}
					originName={originName}
					destinationName={destinationName}
					onCancel={handleBack}
				/>
			);
	}
}
