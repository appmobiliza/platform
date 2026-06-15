import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";

import { useSpeechDestination } from "@/hooks/use-speech-destination";

import { getRealtimeClient, isUsingMockClient } from "@/lib/realtime";
import { trpc } from "@/lib/trpc/client";

import type { SpeechDestinationResult } from "@/types/location";

import type { Place } from "../request-flow-sheet/types";
import {
	CompletedStep,
	ConfirmStep,
	type FlowStage,
	InTransitStep,
	ListeningStep,
	RequestErrorStep,
	ScholarFoundStep,
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
	const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
	const [scholarInfo, setScholarInfo] = useState<{
		id: string;
		name: string;
		image: string | null;
	} | null>(null);
	const [startedAt, setStartedAt] = useState<string | null>(null);

	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const hasStartedListening = useRef(false);
	const realtimeUnsubRef = useRef<(() => void) | null>(null);

	// ─── Dependencies ────────────────────────────────────────────────────

	const createRequest = trpc.requests.create.useMutation();
	const cancelRequest = trpc.requests.cancel.useMutation();
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

	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	// ─── Cleanup timer and realtime sub on unmount ────────────────────────

	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
			realtimeUnsubRef.current?.();
			realtimeUnsubRef.current = null;
		};
	}, []);

	// ─── Realtime subscription ──────────────────────────────────────────

	useEffect(() => {
		if (!activeRequestId) return;

		const channel = `request:${activeRequestId}`;
		let cancelled = false;

		const setup = async () => {
			const client = await getRealtimeClient();
			if (cancelled) return;

			if (isUsingMockClient()) {
				clearTimer();
				setSearchState("idle");
				setElapsedSeconds(0);
				setStage("request-error");
				return;
			}

			const onAccepted = (data: unknown) => {
				// Extract scholar info from event payload
				const payload = data as {
					scholarId?: string;
					scholarName?: string;
					scholarImage?: string | null;
				};

				if (payload?.scholarId && payload?.scholarName) {
					setScholarInfo({
						id: payload.scholarId,
						name: payload.scholarName,
						image: payload.scholarImage ?? null,
					});
				}

				clearTimer();
				setSearchState("idle");
				setElapsedSeconds(0);
				setStage("scholar-found");

				AccessibilityInfo.announceForAccessibility(
					"Bolsista encontrado. Aguarde enquanto o bolsista vai ao seu encontro.",
				);
			};

			const onUnattended = () => {
				setSearchState("unattended");
				if (timerRef.current) {
					clearInterval(timerRef.current);
					timerRef.current = null;
				}
			};

			const onStarted = () => {
				setStartedAt(
					new Date().toLocaleTimeString("pt-BR", {
						hour: "2-digit",
						minute: "2-digit",
					}),
				);
				setStage("in-transit");

				AccessibilityInfo.announceForAccessibility(
					"Deslocamento em andamento.",
				);
			};

			const onCompleted = () => {
				setStage("completed");

				AccessibilityInfo.announceForAccessibility(
					"Viagem concluída com sucesso.",
				);
			};

			const onCancelled = () => {
				setActiveRequestId(null);
				router.back();
			};

			const unsubAccepted = client.subscribe(
				channel,
				"request:accepted",
				onAccepted,
			);
			const unsubStarted = client.subscribe(
				channel,
				"request:started",
				onStarted,
			);
			const unsubCompleted = client.subscribe(
				channel,
				"request:completed",
				onCompleted,
			);
			const unsubUnattended = client.subscribe(
				channel,
				"request:unattended",
				onUnattended,
			);
			const unsubCancelled = client.subscribe(
				channel,
				"request:cancelled",
				onCancelled,
			);

			realtimeUnsubRef.current = () => {
				unsubAccepted();
				unsubStarted();
				unsubCompleted();
				unsubUnattended();
				unsubCancelled();
			};
		};

		setup();

		return () => {
			cancelled = true;
			realtimeUnsubRef.current?.();
			realtimeUnsubRef.current = null;
		};
	}, [activeRequestId, router, reset, clearTimer]);

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
				clearTimer();
				setSearchState("idle");
				setElapsedSeconds(0);
				setStage("request-error");
				return;
			}

			const result = await createRequest.mutateAsync({
				originLocationId: originId,
				destinationLocationId: destinationId,
			});

			if (result.id) {
				setActiveRequestId(result.id);
			}
		} catch {
			clearTimer();
			setSearchState("idle");
			setElapsedSeconds(0);
			setStage("request-error");
		}
	}, [origin, destination, createRequest, utils, clearTimer]);

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
		// Cancel request on backend if there's an active one
		if (activeRequestId) {
			cancelRequest.mutate({ requestId: activeRequestId });
		}
		setActiveRequestId(null);
		realtimeUnsubRef.current?.();
		realtimeUnsubRef.current = null;
		reset();
		router.back();
	}, [reset, router, activeRequestId, cancelRequest]);

	const handleCloseCompleted = useCallback(() => {
		setActiveRequestId(null);
		realtimeUnsubRef.current?.();
		realtimeUnsubRef.current = null;
		reset();
		router.back();
	}, [reset, router]);

	const handleRetry = useCallback(() => {
		hasStartedListening.current = false;
		reset();
		setStage("listening");
		start();
		AccessibilityInfo.announceForAccessibility(
			"Toque no microfone e diga para onde deseja ir.",
		);
	}, [reset, start]);

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

		case "scholar-found":
			return (
				<ScholarFoundStep
					scholarName={scholarInfo?.name ?? "Contribuinte"}
					scholarImage={scholarInfo?.image ?? null}
					originName={originName}
					destinationName={destinationName}
					onCancel={handleBack}
				/>
			);

		case "in-transit":
			return (
				<InTransitStep
					scholarName={scholarInfo?.name ?? "Contribuinte"}
					scholarImage={scholarInfo?.image ?? null}
					originName={originName}
					destinationName={destinationName}
					startedAt={startedAt ?? "--:--"}
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

		case "completed":
			return (
				<CompletedStep
					scholarName={scholarInfo?.name ?? "Contribuinte"}
					scholarImage={scholarInfo?.image ?? null}
					originName={originName}
					destinationName={destinationName}
					onClose={handleCloseCompleted}
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
