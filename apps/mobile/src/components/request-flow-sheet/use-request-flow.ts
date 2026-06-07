import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import * as React from "react";

import { getNearestPoint } from "@/lib/location-store";
import { getRealtimeClient } from "@/lib/realtime";
import {
	cancelAllNotifications,
	showAcceptedNotification,
	showSearchingNotification,
	showUnattendedNotification,
} from "@/lib/request-notifications";
import {
	clearRequestState,
	getRequestState,
	setRequestState,
} from "@/lib/request-store";
import { trpc } from "@/lib/trpc/client";

import type { Place, Stage } from "./types";

/**
 * Tempo máximo de espera no "searching" antes de considerar a
 * solicitação como não atendida (unattended).
 *
 * Este timeout é o mecanismo PRINCIPAL de detecção de não-atendimento.
 * O backend possui um timeout adicional via CRON (`maxServiceRequestTime`)
 * como fallup para evitar que solicitações fiquem "pending" para sempre.
 */
const SEARCH_TIMEOUT_MS = 60_000; // 60 seconds

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

	// Estado da busca
	const [searchState, setSearchState] = React.useState<
		"idle" | "searching" | "unattended" | "error"
	>("idle");
	const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

	// Fetch campus locations from the API (source of truth after seed)
	const { data: campusLocations = [] } = trpc.locations.list.useQuery();

	// Estado real da requisição
	const [activeRequestId, setActiveRequestId] = React.useState<string | null>(
		null,
	);

	// Mutação para criar a solicitação no backend
	const { mutateAsync: createRequest, isPending: isCreating } =
		trpc.requests.create.useMutation();

	// Mutação para marcar como não atendida
	const { mutateAsync: markUnattended } =
		trpc.requests.markUnattended.useMutation();

	// Mutação para cancelar manualmente
	const { mutateAsync: cancelRequest } = trpc.requests.cancel.useMutation();

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
	const realtimeUnsubRef = React.useRef<(() => void) | null>(null);

	// Timer refs
	const timerIntervalRef = React.useRef<ReturnType<
		typeof setInterval
	> | null>(null);
	const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearTimers = React.useCallback(() => {
		if (timerIntervalRef.current) {
			clearInterval(timerIntervalRef.current);
			timerIntervalRef.current = null;
		}
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
	}, []);

	// ─── Persistência de estado ─────────────────────────────────────────────

	// Persiste sempre que os valores relevantes mudam
	React.useEffect(() => {
		if (activeRequestId) {
			setRequestState({
				activeRequestId,
				searchState,
				stage: activeStageRef.current,
				origin,
				destination,
				message,
				requestCreatedAt: Date.now(),
			});
		} else {
			clearRequestState();
		}
	}, [activeRequestId, searchState, origin, destination, message]);

	// ─── Restauração de sessão ──────────────────────────────────────────────
	//
	// Quando o hook monta (app reaberto), verifica se há um estado persistido
	// de uma sessão anterior. Se houver, consulta o backend para saber o
	// status atual da request e restaura o fluxo.

	const persistedState = getRequestState();
	const hasPersistedRequest =
		persistedState.activeRequestId && persistedState.searchState !== "idle";

	const {
		data: historyData,
		isLoading: isHistoryLoading,
	} = trpc.requests.studentHistory.useInfiniteQuery(
		{ limit: 50 },
		{ enabled: hasPersistedRequest },
	);

	// Guarda se já processamos a restauração
	const restorationDoneRef = React.useRef(false);

	React.useEffect(() => {
		if (!hasPersistedRequest || restorationDoneRef.current) return;
		if (isHistoryLoading) return; // ainda carregando
		restorationDoneRef.current = true;

		const requestId = persistedState.activeRequestId!;

		// Restaura dados de localização
		if (persistedState.origin) setOrigin(persistedState.origin);
		if (persistedState.destination)
			setDestination(persistedState.destination);
		if (persistedState.message) setMessage(persistedState.message);

		// Busca a request atual no histórico
		const allItems = historyData?.pages.flatMap((p) => p.items) ?? [];
		const current = allItems.find((item) => item.id === requestId);

		if (!current) {
			// Request não encontrada — limpamos o estado
			clearRequestState();
			return;
		}

		const status: string = current.status;

		if (
			status === "accepted" ||
			status === "ongoing" ||
			status === "completed"
		) {
			// Já foi aceito enquanto estávamos fora — vai direto pra trip
			setActiveRequestId(requestId);
			setSearchState("idle");
			openStage("trip");
		} else if (status === "unattended") {
			setActiveRequestId(requestId);
			setSearchState("unattended");
			openStage("searching");
		} else if (status === "cancelled") {
			clearRequestState();
		} else {
			// Ainda "pending" — restaura a busca
			setActiveRequestId(requestId);

			if (persistedState.searchState === "unattended") {
				setSearchState("unattended");
			} else {
				setSearchState("searching");
				if (persistedState.requestCreatedAt) {
					const elapsed = Math.floor(
						(Date.now() - persistedState.requestCreatedAt) / 1000,
					);
					setElapsedSeconds(elapsed);
				}
			}

			openStage("searching");
		}
	}, [
		hasPersistedRequest,
		persistedState,
		historyData,
		isHistoryLoading,
		openStage,
	]);

	/**
	 * Creates the service request in the backend and transitions to "searching".
	 *
	 * Transiciona imediatamente para a UI de busca antes mesmo da requisição
	 * HTTP, para uma experiência mais fluida.
	 */
	const confirmRequest = React.useCallback(
		async (originId?: string, destinationId?: string) => {
			// Transiciona imediatamente para "searching" antes mesmo da requisição
			setSearchState("searching");
			setElapsedSeconds(0);
			transitionTo("searching");

			// Mostra notificação persistente
			showSearchingNotification();

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
			} catch (error) {
				console.error("Erro ao criar solicitação", error);
				setSearchState("error");
				clearTimers();
				cancelAllNotifications();
			}
		},
		[createRequest, message, transitionTo, origin, destination, utils],
	);

	const exitFlow = React.useCallback(() => {
		clearTimers();
		setSearchState("idle");
		setElapsedSeconds(0);
		setActiveRequestId(null);
		clearRequestState();
		cancelAllNotifications();
		router.back();
	}, [router, clearTimers]);

	const dismissAndExit = React.useCallback(() => {
		queuedStageRef.current = null;

		// Se estava na busca *ativa*, cancela no backend
		const stage = activeStageRef.current;
		if (
			stage === "searching" &&
			activeRequestId &&
			searchState === "searching"
		) {
			cancelRequest({ requestId: activeRequestId });
		}

		clearTimers();
		setSearchState("idle");
		setElapsedSeconds(0);
		cancelAllNotifications();
		refs[activeStageRef.current].current?.dismiss();
	}, [refs, activeRequestId, cancelRequest, clearTimers, searchState]);

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

	// ─── Timer de elapsed + timeout da busca ─────────────────────────────────

	React.useEffect(() => {
		if (searchState !== "searching") return;

		// Contagem de segundos decorridos
		timerIntervalRef.current = setInterval(() => {
			setElapsedSeconds((prev) => prev + 1);
		}, 1000);

		return () => {
			clearTimers();
		};
	}, [searchState, clearTimers]);

	// Timeout real para unattended
	React.useEffect(() => {
		if (searchState !== "searching" || !activeRequestId) return;

		// Se o tempo já decorrido ultrapassou o limite, marca imediatamente
		// (útil quando a restauração de sessão encontra um request já vencido)
		if (elapsedSeconds >= SEARCH_TIMEOUT_MS / 1000) {
			setSearchState("unattended");
			clearTimers();
			showUnattendedNotification();
			markUnattended({ requestId: activeRequestId });
			return;
		}

		const remainingMs = SEARCH_TIMEOUT_MS - elapsedSeconds * 1000;

		timeoutRef.current = setTimeout(() => {
			setSearchState("unattended");
			clearTimers();
			showUnattendedNotification();

			// Marca como não atendida no backend
			markUnattended({ requestId: activeRequestId });
		}, remainingMs);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [searchState, activeRequestId, elapsedSeconds, markUnattended, clearTimers]);

	// ─── Inscrição em eventos de realtime ──────────────────────────────────

	React.useEffect(() => {
		if (!activeRequestId) return;

		const channel = `request:${activeRequestId}`;
		let cancelled = false;

		const setup = async () => {
			const client = await getRealtimeClient();
			if (cancelled) return;

			const onAccepted = () => {
				clearTimers();
				setSearchState("idle");
				setElapsedSeconds(0);
				cancelAllNotifications();
				showAcceptedNotification();
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

			const onUnattended = () => {
				setSearchState("unattended");
				clearTimers();
				cancelAllNotifications();
				showUnattendedNotification();
			};

			const unsubAccepted = client.subscribe(
				channel,
				"request:accepted",
				onAccepted,
			);
			const unsubStarted = client.subscribe(
				channel,
				"request:started",
				() => {
					// Atualização de status
				},
			);
			const unsubCompleted = client.subscribe(
				channel,
				"request:completed",
				onCompleted,
			);
			const unsubCancelled = client.subscribe(
				channel,
				"request:cancelled",
				onCancelled,
			);
			const unsubUnattended = client.subscribe(
				channel,
				"request:unattended",
				onUnattended,
			);

			const unsubscribe = () => {
				unsubAccepted();
				unsubStarted();
				unsubCompleted();
				unsubCancelled();
				unsubUnattended();
			};

			realtimeUnsubRef.current = unsubscribe;
		};

		setup();

		return () => {
			cancelled = true;
			realtimeUnsubRef.current?.();
			realtimeUnsubRef.current = null;
		};
	}, [activeRequestId, exitFlow, transitionTo, clearTimers]);

	// Initialize origin from the nearest point calculated on the Home screen
	React.useEffect(() => {
		const stored = getNearestPoint();
		if (stored) {
			setOrigin(stored);
		}
	}, []);

	// Only open the initial stage if we are NOT restoring a session
	React.useEffect(() => {
		if (!hasPersistedRequest) {
			openStage("destination-selection");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openStage]);

	// Map API locations → LocationItem format for AddressRouteInput
	const campusLocationItems = React.useMemo(
		() =>
			campusLocations.map((loc) => ({
				name: loc.name,
				latitude: loc.latitude,
				longitude: loc.longitude,
				abbreviation: loc.abbreviation ?? undefined,
				abbrev: loc.abbreviation ?? undefined,
			})),
		[campusLocations],
	);

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
		searchState,
		elapsedSeconds,
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
