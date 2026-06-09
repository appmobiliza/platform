import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as React from "react";
import { Alert } from "react-native";

import { getNearestPoint } from "@/lib/location-store";
import { getRealtimeClient } from "@/lib/realtime";
import {
	cancelAllNotifications,
	showAcceptedNotification,
	showSearchingNotification,
	showUnattendedNotification,
} from "@/lib/request-notifications";
import type { ScholarInfo } from "@/lib/request-store";
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
				"route-selection": destinationSelectionRef,
				"start-confirm": startConfirmRef,
				searching: searchingRef,
				trip: tripRef,
			}) as const satisfies Record<
				Stage,
				React.RefObject<BottomSheetModal | null>
			>,
		[],
	);

	const activeStageRef = React.useRef<Stage>("route-selection");
	const queuedStageRef = React.useRef<Stage | null>(null);
	const [activeStage, setActiveStage] = React.useState<Stage>(
		"route-selection",
	);

	const [origin, setOrigin] = React.useState<Place | null>(null);
	const [destination, setDestination] = React.useState<Place | null>(null);

	// ─── Pre-set destination from URL query param (from PlaceCard on Home) ──
	const { destination: destinationParam } = useLocalSearchParams<{
		destination?: string;
	}>();
	const preselectedDestRef = React.useRef(destinationParam ?? undefined);
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

	// Dados do contribuinte que aceitou (preenchido pelo evento request:accepted)
	const [scholarInfo, setScholarInfo] = React.useState<ScholarInfo | null>(
		() => getRequestState().scholar ?? null,
	);

	// Se o deslocamento já está em andamento (scholar pegou o aluno e está a caminho do destino)
	const [isOngoing, setIsOngoing] = React.useState<boolean>(
		() => getRequestState().isOngoing ?? false,
	);

	// Mutação para criar a solicitação no backend
	const { mutateAsync: createRequest, isPending: isCreating } =
		trpc.requests.create.useMutation();

	// Mutação para marcar como não atendida
	const { mutateAsync: markUnattended } =
		trpc.requests.markUnattended.useMutation();

	// Mutação para cancelar manualmente
	const { mutateAsync: cancelRequest } = trpc.requests.cancel.useMutation();

	// ─── Guarda idempotente para evitar cancelamentos duplicados ──────────────
	//
	// Como as chamadas de cancelamento são fire-and-forget e podem vir de
	// múltiplos caminhos (dismissAndExit, handleDismiss, cleanup de desmonte),
	// esta ref garante que o cancelamento só seja enviado uma vez por request.
	const cancelRequestedRef = React.useRef(false);

	// Reseta o guard sempre que um novo requestId for definido
	React.useEffect(() => {
		cancelRequestedRef.current = false;
		void activeRequestId;
	}, [activeRequestId]);

	const safeCancelRequest = React.useCallback(
		(requestId: string) => {
			if (cancelRequestedRef.current) return;
			cancelRequestedRef.current = true;
			cancelRequest({ requestId }).catch((err) => {
				console.error(
					"[useRequestFlow] Failed to cancel request:",
					err,
				);
			});
		},
		[cancelRequest],
	);

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

	// ─── Cancela requisição ativa ao desmontar ─────────────────────────────
	//
	// Quando o usuário navega para trás (botão de voltar ou gesto) enquanto
	// está na busca ativa, o componente desmonta sem passar pelo handleDismiss.
	// Este efeito garante que a solicitação seja cancelada no backend.
	const cancelOnUnmountRef = React.useRef(false);
	cancelOnUnmountRef.current =
		!!activeRequestId && searchState === "searching";

	const setCancelOnUnmountFalse = React.useCallback(() => {
		cancelOnUnmountRef.current = false;
	}, []);

	const activeRequestIdRef = React.useRef(activeRequestId);
	activeRequestIdRef.current = activeRequestId;

	// eslint-disable-next-line react-hooks/exhaustive-deps
	React.useEffect(() => {
		return () => {
			if (
				cancelOnUnmountRef.current &&
				activeRequestIdRef.current
			) {
				safeCancelRequest(activeRequestIdRef.current);
			}
		};
	}, []);

	// ─── Persistência de estado ─────────────────────────────────────────────

	// Persiste sempre que os valores relevantes mudam
	React.useEffect(() => {
		setRequestState({
			activeRequestId,
			searchState,
			stage: activeStage,
			origin,
			destination,
			message,
			requestCreatedAt: activeRequestId ? Date.now() : null,
			scholar: scholarInfo,
			isOngoing,
		});
	}, [activeRequestId, searchState, activeStage, origin, destination, message, scholarInfo, isOngoing]);

	// ─── Restauração de sessão ──────────────────────────────────────────────
	//
	// Quando o hook monta (app reaberto), verifica se há um estado persistido
	// de uma sessão anterior. Se houver, consulta o backend para saber o
	// status atual da request e restaura o fluxo.

	const persistedState = getRequestState();
	// Restaura também quando estávamos na tela de viagem (trip),
	// pois nesse estado o searchState é "idle" e não passaria no
	// filtro abaixo
	const hasPersistedRequest = !!(
		persistedState.activeRequestId &&
		(persistedState.searchState !== "idle" ||
			persistedState.stage === "trip")
	);

	// Guarda se já processamos a restauração
	const restorationDoneRef = React.useRef(false);

	React.useEffect(() => {
		if (!hasPersistedRequest || restorationDoneRef.current) return;
		restorationDoneRef.current = true;

		const requestId = persistedState.activeRequestId!;

		// Restaura dados de localização
		if (persistedState.origin) setOrigin(persistedState.origin);
		if (persistedState.destination)
			setDestination(persistedState.destination);
		if (persistedState.message) setMessage(persistedState.message);

		// Busca a request atual no histórico
		utils.requests.studentHistory
			.fetchInfinite({ limit: 50 })
			.then((data) => {
				const allItems = data.pages.flatMap((p) => p.items);
				const current = allItems.find((item) => item.id === requestId);

				if (!current) {
					// Request não encontrada — limpamos o estado
					clearRequestState();
					return;
				}

				const status: string = current.status;

				if (status === "completed") {
					// Já foi concluído enquanto estávamos fora — limpa e sai
					clearTimers();
					setSearchState("idle");
					setElapsedSeconds(0);
					setActiveRequestId(null);
					clearRequestState();
					cancelAllNotifications();
					router.back();
					return;
				}

				if (
					status === "accepted" ||
					status === "ongoing"
				) {
					// Já foi aceito enquanto estávamos fora — vai direto pra trip
					setActiveRequestId(requestId);
					setSearchState("idle");
					setIsOngoing(status === "ongoing");

					// Restaura scholar do estado persistido ou extrai do histórico
					if (persistedState.scholar) {
						setScholarInfo(persistedState.scholar);
					} else if (current.attendance?.scholarProfile?.user) {
						const user = current.attendance.scholarProfile.user;
						const profile = current.attendance.scholarProfile;
						setScholarInfo({
							id: user.id,
							name: user.name ?? "",
							image: user.image ?? null,
							createdAt: profile.createdAt ? new Date(profile.createdAt).toISOString() : null,
							shift: null, // será obtido via getCurrentShift() no componente
						});
					}

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
			})
			.catch(() => {
				clearRequestState();
			});
	}, [hasPersistedRequest, persistedState, utils, openStage]);

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
		setIsOngoing(false);
		clearRequestState();
		cancelAllNotifications();
		setCancelOnUnmountFalse();
		router.back();
	}, [router, clearTimers, setCancelOnUnmountFalse]);

	const dismissAndExit = React.useCallback(() => {
		queuedStageRef.current = null;

		// Se estava na busca *ativa*, cancela no backend
		const stage = activeStageRef.current;
		if (
			stage === "searching" &&
			activeRequestId &&
			searchState === "searching"
		) {
			safeCancelRequest(activeRequestId);
		}

		clearTimers();
		setSearchState("idle");
		setElapsedSeconds(0);
		cancelAllNotifications();
		refs[activeStageRef.current].current?.dismiss();
	}, [refs, activeRequestId, safeCancelRequest, clearTimers, searchState]);

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
					openStage("route-selection");
					return;
				}

				if (stage === "route-selection") {
					openStage("destination");
					return;
				}

				if (stage === "start-confirm") {
					openStage("route-selection");
					return;
				}

				// Cancela a solicitação no backend se o usuário fechou a busca
				if (
					stage === "searching" &&
					activeRequestId &&
					searchState === "searching"
				) {
					safeCancelRequest(activeRequestId);
				}

				exitFlow();
			}
		},
		[exitFlow, openStage, refs, activeRequestId, safeCancelRequest, searchState],
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
	}, [
		searchState,
		activeRequestId,
		elapsedSeconds,
		markUnattended,
		clearTimers,
	]);

	// ─── Inscrição em eventos de realtime ──────────────────────────────────

	React.useEffect(() => {
		if (!activeRequestId) return;

		const channel = `request:${activeRequestId}`;
		let cancelled = false;

		const setup = async () => {
			const client = await getRealtimeClient();
			if (cancelled) return;

			const onAccepted = (data: unknown) => {
				clearTimers();
				setSearchState("idle");
				setElapsedSeconds(0);
				cancelAllNotifications();

				// Extrai dados do contribuinte do payload do evento
				const payload = data as {
					scholarId?: string;
					scholarName?: string;
					scholarImage?: string | null;
					scholarCreatedAt?: string | null;
					scholarShift?: string | null;
				};
				if (payload?.scholarId && payload?.scholarName) {
					setScholarInfo({
						id: payload.scholarId,
						name: payload.scholarName,
						image: payload.scholarImage ?? null,
						createdAt: payload.scholarCreatedAt ?? null,
						shift: payload.scholarShift ?? null,
					});
				}

				showAcceptedNotification();
				transitionTo("trip");
			};

			const onCompleted = () => {
				setActiveRequestId(null);
				utils.requests.studentHistory.invalidate();
				Alert.alert(
					"Deslocamento concluído",
					"Seu deslocamento foi finalizado com sucesso. Obrigado por usar o Mobiliza!",
				);
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
					setIsOngoing(true);
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
	}, [activeRequestId, exitFlow, transitionTo, clearTimers, utils]);

	// Initialize origin from the nearest point calculated on the Home screen
	React.useEffect(() => {
		const stored = getNearestPoint();
		if (stored) {
			setOrigin(stored);
		}
	}, []);

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

	// ─── Auto-set destination when a name was passed via URL (from Home PlaceCard) ──
	//
	// Inserted before the stage-opening openStage call so the sheet presents
	// with the destination already filled.
	React.useEffect(() => {
		const name = preselectedDestRef.current;
		if (!name || destination) return;

		// Try exact name match first, then abbreviation match
		const byName = campusLocationsByName.get(name);
		if (byName) {
			setDestination({
				name: byName.name,
				abbreviation: byName.abbreviation,
				latitude: byName.latitude,
				longitude: byName.longitude,
			});
			preselectedDestRef.current = undefined;
			return;
		}

		// Fallback to matching by abbreviation
		const byAbbrev = campusLocationItems.find(
			(l) => l.abbreviation?.toLowerCase() === name.toLowerCase(),
		);
		if (byAbbrev) {
			setDestination({
				name: byAbbrev.name,
				abbreviation: byAbbrev.abbreviation,
				latitude: byAbbrev.latitude,
				longitude: byAbbrev.longitude,
			});
			preselectedDestRef.current = undefined;
		}
	}, [destination, campusLocationsByName, campusLocationItems]);

	// Only open the initial stage if we are NOT restoring a session
	React.useEffect(() => {
		if (!hasPersistedRequest) {
			openStage("route-selection");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openStage]);

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
		scholarInfo,
		isOngoing,
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
