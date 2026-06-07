import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import * as React from "react";

import { getNearestPoint } from "@/lib/location-store";
import { getRealtimeClient } from "@/lib/realtime";
import { trpc } from "@/lib/trpc/client";

import type { Place, Stage } from "./types";

function useRequestFlow() {
	const router = useRouter();
	const utils = trpc.useContext();

	const destinationRef = React.useRef<BottomSheetModal>(null);
	const destinationSelectionRef = React.useRef<BottomSheetModal>(null);
	const startConfirmRef = React.useRef<BottomSheetModal>(null);
	const searchingRef = React.useRef<BottomSheetModal>(null);
	const tripRef = React.useRef<BottomSheetModal>(null);

	const refs = React.useMemo(
		() =>
			({
				destination: destinationRef,
				"destination-selection": destinationSelectionRef,
				"start-confirm": startConfirmRef,
				searching: searchingRef,
				trip: tripRef,
			}) as const satisfies Record<
				Stage,
				React.RefObject<BottomSheetModal | null>
			>,
		[],
	);

	const activeStageRef = React.useRef<Stage>("destination-selection");
	const queuedStageRef = React.useRef<Stage | null>(null);
	const [activeStage, setActiveStage] = React.useState<Stage>(
		"destination-selection",
	);

	const [origin, setOrigin] = React.useState<Place | null>(null);
	const [destination, setDestination] = React.useState<Place | null>(null);
	const [message, setMessage] = React.useState("");

	// Fetch campus locations from the API (source of truth after seed)
	const { data: campusLocations = [] } = trpc.locations.list.useQuery();

	// Estado real da requisição
	const [activeRequestId, setActiveRequestId] = React.useState<string | null>(
		null,
	);

	// Mutação para criar a solicitação no backend
	const { mutateAsync: createRequest, isPending: isCreating } =
		trpc.requests.create.useMutation();

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

	// Referência para armazenar a função de cancelamento da inscrição
	// realtime, para poder limpá-la ao desmontar ou ao mudar de request.
	const realtimeUnsubRef = React.useRef<(() => void) | null>(null);

	/**
	 * Creates the service request in the backend and transitions to "searching".
	 *
	 * When called without arguments, resolves the campus_location database IDs
	 * from the current `origin` / `destination` state by fetching the locations
	 * list from the API — this is the normal UI flow.
	 *
	 * Tests/direct usage may pass explicit IDs to skip the API round-trip.
	 */
	const confirmRequest = React.useCallback(
		async (originId?: string, destinationId?: string) => {
			// Resolve location IDs from the API when not provided explicitly
			if (!originId || !destinationId) {
				if (!origin || !destination) {
					console.warn(
						"[useRequestFlow] confirmRequest called without IDs and no origin/destination set",
					);
					return;
				}

				try {
					const locations = await utils.locations.list.fetch();
					const map = new Map(locations.map((l) => [l.name, l.id]));
					originId = map.get(origin.name);
					destinationId = map.get(destination.name);
				} catch (err) {
					console.error(
						"[useRequestFlow] Failed to resolve location IDs:",
						err,
					);
					return;
				}

				if (!originId || !destinationId) {
					console.error(
						"[useRequestFlow] Could not find location IDs for the selected places",
					);
					return;
				}
			}

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
		},
		[createRequest, message, transitionTo, origin, destination, utils],
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

	// ─── Inscrição em eventos de realtime ──────────────────────────────────
	//
	// Quando `activeRequestId` é definido (após criar a solicitação),
	// inscreve-se no canal `request:{id}` para receber atualizações
	// sobre o status do atendimento em tempo real.

	React.useEffect(() => {
		if (!activeRequestId) return;

		const channel = `request:${activeRequestId}`;
		let cancelled = false;

		const setup = async () => {
			const client = await getRealtimeClient();
			if (cancelled) return;

			// Handler central que gerencia as transições de estado
			const onAccepted = () => {
				transitionTo("trip");
			};

			const onCompleted = () => {
				setActiveRequestId(null);
				exitFlow();
			};

			const onCancelled = () => {
				setActiveRequestId(null);
				exitFlow();
			};

			// Inscreve nos eventos relevantes
			const unsubAccepted = client.subscribe(channel, "request:accepted", onAccepted);
			const unsubStarted = client.subscribe(channel, "request:started", () => {
				// Atualização de status — pode ser usada para mostrar
				// "a caminho" na UI futuramente
			});
			const unsubCompleted = client.subscribe(channel, "request:completed", onCompleted);
			const unsubCancelled = client.subscribe(channel, "request:cancelled", onCancelled);

			// Agrupa o cleanup em uma única função
			const unsubscribe = () => {
				unsubAccepted();
				unsubStarted();
				unsubCompleted();
				unsubCancelled();
			};

			realtimeUnsubRef.current = unsubscribe;
		};

		setup();

		return () => {
			cancelled = true;
			realtimeUnsubRef.current?.();
			realtimeUnsubRef.current = null;
		};
	}, [activeRequestId, exitFlow, transitionTo]);

	// Initialize origin from the nearest point calculated on the Home screen
	React.useEffect(() => {
		const stored = getNearestPoint();
		if (stored) {
			setOrigin(stored);
		}
	}, []);

	React.useEffect(() => {
		openStage("destination-selection");
	}, [openStage]);

	// Map API locations → LocationItem format for AddressRouteInput
	const campusLocationItems = React.useMemo(
		() =>
			campusLocations.map((loc) => ({
				name: loc.name,
				latitude: loc.latitude,
				longitude: loc.longitude,
				abbreviation: loc.abbreviation ?? undefined,
				// Alias for suggestion rendering (which expects `abbrev`)
				abbrev: loc.abbreviation ?? undefined,
			})),
		[campusLocations],
	);

	// O(1) lookup by name for the callbacks
	const campusLocationsByName = React.useMemo(
		() => new Map(campusLocationItems.map((l) => [l.name, l])),
		[campusLocationItems],
	);

	return {
		activeStage,
		activeRequestId,
		campusLocationItems,
		campusLocationsByName,
		confirmRequest,
		isCreating,
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
