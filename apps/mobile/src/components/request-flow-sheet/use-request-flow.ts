import * as React from "react";

import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

import { trpc } from "@/lib/trpc/client";
import type { Stage } from "./types";

function useRequestFlow() {
	const router = useRouter();

	const destinationRef = React.useRef<BottomSheetModal>(null);
	const destinationSelectionRef = React.useRef<BottomSheetModal>(null);
	const startConfirmRef = React.useRef<BottomSheetModal>(null);
	const searchingRef = React.useRef<BottomSheetModal>(null);
	const tripRef = React.useRef<BottomSheetModal>(null);

	const refs = React.useMemo(() => ({
		destination: destinationRef,
		"destination-selection": destinationSelectionRef,
		"start-confirm": startConfirmRef,
		searching: searchingRef,
		trip: tripRef,
	} as const satisfies Record<
		Stage,
		React.RefObject<BottomSheetModal | null>
	>), []);

	const activeStageRef = React.useRef<Stage>("destination-selection");
	const queuedStageRef = React.useRef<Stage | null>(null);
	const [activeStage, setActiveStage] = React.useState<Stage>(
		"destination-selection",
	);

	const [destinationValue, setDestinationValue] =
		React.useState("Biblioteca Central");
	const [originLabel, setOriginLabel] = React.useState(
		"Instituto de Computação",
	);
	const [originSummary, setOriginSummary] = React.useState(
		"Instituto de Computação, UFAL",
	);
	const [message, setMessage] = React.useState("");

	// Estado real da requisição
	const [activeRequestId, setActiveRequestId] = React.useState<string | null>(null);

	// Mutação para criar a solicitação no backend
	const { mutateAsync: createRequest, isPending: isCreating } = trpc.requests.create.useMutation();

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

	const confirmRequest = React.useCallback(async (originId: string, destinationId: string) => {
		try {
			const result = await createRequest({
				originLocationId: originId,
				destinationLocationId: destinationId,
				notes: message,
			});
			setActiveRequestId(result.id);
			transitionTo("searching");
		} catch (error) {
			console.error("Erro ao criar solicitação", error);
			// Idealmente mostrar um Toast de erro aqui
		}
	}, [createRequest, message, transitionTo]);

	// Escuta atualizações de status via WebSockets
	trpc.requests.onStatusChange.useSubscription(
		{ requestId: activeRequestId! },
		{
			enabled: activeRequestId !== null,
			onData(data) {
				if (data.status === "accepted") {
					transitionTo("trip");
				}
				if (data.status === "completed" || data.status === "cancelled") {
					setActiveRequestId(null);
					exitFlow();
				}
			},
		}
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
		openStage("destination-selection");
	}, [openStage]);

	return {
		activeStage,
		activeRequestId,
		confirmRequest,
		isCreating,
		destinationRef,
		destinationSelectionRef,
		destinationValue,
		dismissAndExit,
		handleDismiss,
		message,
		originLabel,
		originSummary,
		refs,
		searchingRef,
		setDestinationValue,
		setMessage,
		setOriginLabel,
		setOriginSummary,
		startConfirmRef,
		transitionTo,
		tripRef,
	};
}

export { useRequestFlow };
