import { disabilityTypeLabels, getCurrentShift } from "@mobiliza/contracts";

import { useRouter } from "expo-router";
import {
	CheckCircle2,
	Clock,
	Info,
	LogIn,
	MapPin,
	Palmtree,
	Play,
	Power,
} from "lucide-react-native";
import { type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	ScrollView,
	View,
} from "react-native";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { toast } from "@/components/ui/toast";

import { usePositionBroadcaster } from "@/hooks/use-position-broadcaster";
import { useShiftState } from "@/hooks/use-shift-state";
import { useUserLocation } from "@/hooks/use-user-location";

import { getRealtimeClient } from "@/lib/realtime";
import { trpc } from "@/lib/trpc/client";

import {
	clearActiveAttendance,
	saveActiveAttendance,
	useActiveAttendance,
} from "@/stores/active-attendance-store";

import { AddressRoute } from "../address";
import {
	PendingRequestCard,
	type Service,
	ServiceStatus,
} from "./pending-request-card";
import { ScholarHeader } from "./scholar-header";

/**
 * Ignora a validação que impede solicitar turno extra para o próprio turno
 * registrado. Útil durante desenvolvimento para testar fluxos extras sem
 * precisar aguardar mudanças de período.
 */
const BYPASS_EXTRA_VALIDATION = false;

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function EmptyStateCard({ children }: { children: ReactNode }) {
	return (
		<View className="items-center justify-center rounded-2xl border border-border p-6 min-h-[220px]">
			{children}
		</View>
	);
}

function MainContentWrapper({ children }: { children: ReactNode }) {
	return <View className="flex-1 px-6 pb-4 gap-4">{children}</View>;
}

function SectionTitle({
	label,
	children,
}: {
	label: string;
	children?: ReactNode;
}) {
	return (
		<View className="flex-row items-center justify-between">
			<Text className="text-lg font-bold text-foreground">{label}</Text>
			{children}
		</View>
	);
}

function PreviousServicesList({ services }: { services?: Service[] }) {
	const router = useRouter();
	const previousServices = services ?? [];

	return (
		<View className="gap-4">
			<SectionTitle label="Atendimentos hoje" />

			<FlatList
				data={previousServices}
				keyExtractor={(item) => item.id}
				scrollEnabled={false}
				ItemSeparatorComponent={() => <View className="h-4" />}
				renderItem={({ item }) => {
					const initials = item.student.name
						.split(" ")
						.map((namePart) => namePart[0])
						.join("")
						.slice(0, 2)
						.toUpperCase();
					const finishedTime = item.finishedAt
						? item.finishedAt.toLocaleTimeString("pt-BR", {
								hour: "2-digit",
								minute: "2-digit",
							})
						: "--:--";
					const durationMinutes =
						item.startedAt && item.finishedAt
							? Math.max(
									1,
									Math.round(
										(item.finishedAt.getTime() -
											item.startedAt.getTime()) /
											60000,
									),
								)
							: undefined;

					return (
						<Pressable
							onPress={() => router.push(`/history/${item.id}`)}
						>
							<View className="rounded-md border border-border bg-card p-4">
								<View className="mb-4 flex-row items-center justify-between">
									<View className="flex-row items-center gap-3">
										<Avatar
											alt={`Avatar de ${item.student.name}`}
											className="h-12 w-12"
										>
											<AvatarFallback>
												<Text className="font-bold">
													{initials}
												</Text>
											</AvatarFallback>
										</Avatar>
										<View>
											<Text className="text-base font-bold text-foreground">
												{item.student.name}
											</Text>
											<Text className="text-sm text-muted-foreground">
												{item.student.disability}
											</Text>
										</View>
									</View>
									<Badge
										variant={
											item.status ===
											ServiceStatus.Cancelled
												? "destructive"
												: "success"
										}
									>
										<Text>
											{item.status ===
											ServiceStatus.Cancelled
												? "Cancelado"
												: "Concluído"}
										</Text>
									</Badge>
								</View>

								<View className="flex-row items-center justify-between border-t border-border gap-6 pt-3">
									<View className="flex-row items-center gap-1 flex-1">
										<Icon
											icon={MapPin}
											color="--foreground"
											size={16}
										/>
										<Text
											className="flex-1 text-sm text-muted-foreground"
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{item.route.origin} →{" "}
											{item.route.destination}
										</Text>
									</View>
									<View className="flex-row items-center gap-1">
										<Icon
											icon={Clock}
											color="--foreground"
											size={16}
										/>
										<Text className="text-sm text-muted-foreground">
											{finishedTime}
											{durationMinutes
												? ` - ${durationMinutes}m`
												: ""}
										</Text>
									</View>
								</View>
							</View>
						</Pressable>
					);
				}}
			/>
		</View>
	);
}

// ─── Componente principal ────────────────────────────────────────────────────

export function ScholarHome() {
	const router = useRouter();

	// ─── Queries ─────────────────────────────────────────────────────────────

	const {
		shiftState,
		currentShiftInfo,
		scholarName,
		isLoadingShift,
		activeShiftLog,
		me,
		currentShift,
		shiftSchedule,
	} = useShiftState();

	// ─── Position broadcasting (visible to students during search) ──────────
	const scholarLocation = useUserLocation({
		enabled: !!activeShiftLog,
	});
	usePositionBroadcaster({
		enabled: !!activeShiftLog,
		location: scholarLocation,
		channel: "scholar:positions",
		event: "position",
	});

	// Solicitações pendentes (só busca quando o turno está ativo)
	const { data: availableRequests = [] } = trpc.requests.pending.useQuery(
		undefined,
		{
			enabled: activeShiftLog !== null && activeShiftLog !== undefined,
		},
	);

	// Atendimento ativo do bolsista (se houver)
	// Busca independentemente do turno para funcionar mesmo se o turno
	// terminou mas o atendimento ainda está ativo
	const { data: activeAttendance } = trpc.requests.active.useQuery();

	// Estado persistido do atendimento ativo — exibição instantânea
	const persistedActive = useActiveAttendance();

	// Ref para capturar persistedActive sem disparar re-render no useEffect
	const persistedActiveRef = useRef(persistedActive);
	persistedActiveRef.current = persistedActive;

	// Reconciliação: quando o servidor responde, atualiza o armazenamento local
	// e limpa se o atendimento não existir mais (ex.: concluído em outro dispositivo)
	useEffect(() => {
		// activeAttendance é undefined durante o loading — aguarda resolução
		if (activeAttendance === undefined) return;

		if (activeAttendance === null) {
			// Servidor confirmou que não há atendimento ativo — limpa local
			if (persistedActiveRef.current) {
				clearActiveAttendance();
			}
		} else if (activeAttendance) {
			saveActiveAttendance({
				requestId: activeAttendance.requestId,
				studentName:
					activeAttendance.request.studentProfile.user?.name ??
					`Estudante ${activeAttendance.request.studentProfile.id.slice(0, 4)}`,
				disability: activeAttendance.request.studentProfile.disabilities
					.map((d) => disabilityTypeLabels[d.disabilityType])
					.join(", "),
				observation: activeAttendance.request.notes ?? "",
				originName: activeAttendance.request.originLocation.name,
				destinationName:
					activeAttendance.request.destinationLocation.name,
				// Timestamps do tRPC já são strings ISO
				startedAt: activeAttendance.startedAt ?? null,
				acceptedAt: activeAttendance.acceptedAt,
			});
		}
		// Só depende do activeAttendance para evitar loop de salvamento local
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeAttendance]);

	// ─── Mutations ───────────────────────────────────────────────────────────

	const utils = trpc.useUtils();

	// ─── Realtime — Novas solicitações pendentes ────────────────────────────
	//
	// Quando o turno está ativo, inscreve-se no canal `requests:pending`
	// para receber notificações de novas solicitações em tempo real.

	useEffect(() => {
		// Só escuta quando o turno está ativo
		if (!activeShiftLog) return;

		const unsubPromise = getRealtimeClient().then((client) => {
			const unsubNew = client.subscribe(
				"requests:pending",
				"request:new",
				() => {
					// Invalida a query de pendentes para re-buscar
					// e mostrar a nova solicitação imediatamente
					utils.requests.pending.invalidate();
				},
			);

			const unsubAccepted = client.subscribe(
				"requests:pending",
				"request:accepted",
				() => {
					// Outro bolsista aceitou — remove da lista
					utils.requests.pending.invalidate();
				},
			);

			const unsubCancelled = client.subscribe(
				"requests:pending",
				"request:cancelled",
				() => {
					// Solicitação foi cancelada pelo estudante —
					// invalida a lista para removê-la da UI
					utils.requests.pending.invalidate();
				},
			);

			const unsubUnattended = client.subscribe(
				"requests:pending",
				"request:unattended",
				() => {
					// Solicitação expirou — remove da lista
					utils.requests.pending.invalidate();
				},
			);

			return () => {
				unsubNew();
				unsubAccepted();
				unsubCancelled();
				unsubUnattended();
			};
		});

		return () => {
			unsubPromise.then((unsub) => unsub());
		};
	}, [activeShiftLog, utils.requests.pending]);

	const { mutate: startShift, isPending: isStartingShift } =
		trpc.shiftLogs.startShift.useMutation({
			onSuccess: () => {
				utils.shiftLogs.getActiveShift.invalidate();
				utils.shiftLogs.completedShiftForToday.invalidate();
				utils.profiles.me.invalidate();
			},
			onError: (error) => {
				console.error("[startShift] Erro:", error.message);
				toast.error("Erro ao iniciar turno", {
					description: error.message ?? "Tente novamente mais tarde.",
				});
			},
		});

	const { mutate: endShift, isPending: isEndingShift } =
		trpc.shiftLogs.endShift.useMutation({
			onSuccess: () => {
				utils.shiftLogs.getActiveShift.invalidate();
				utils.shiftLogs.completedShiftForToday.invalidate();
				utils.profiles.me.invalidate();
			},
		});

	// ─── Dev: deletar último turno (long‑press no logo) ───────────────────────

	const { mutate: devDeleteLatestShiftLog } =
		trpc.shiftLogs.devDeleteLatestShiftLog.useMutation({
			onSuccess: () => {
				utils.shiftLogs.getActiveShift.invalidate();
				utils.shiftLogs.completedShiftForToday.invalidate();
				utils.profiles.me.invalidate();
				toast.success("Registro de turno removido", {
					description: "Você pode iniciar um novo turno normalmente.",
				});
			},
			onError: (error) => {
				toast.error("Erro ao remover turno", {
					description: error.message,
				});
			},
		});

	// ─── Aceitar solicitação ────────────────────────────────────────────────

	const { mutate: acceptRequest, isPending: isAccepting } =
		trpc.requests.accept.useMutation({
			onSuccess: (_, variables) => {
				// Persiste os dados do atendimento localmente para exibição instantânea
				// ao voltar para home ou reabrir o app
				const acceptedRequest = availableRequests.find(
					(r) => r.id === variables.requestId,
				);
				if (acceptedRequest) {
					saveActiveAttendance({
						requestId: variables.requestId,
						studentName:
							acceptedRequest.studentProfile.nickname ??
							`Estudante ${acceptedRequest.studentProfile.id.slice(0, 4)}`,
						disability: acceptedRequest.studentProfile.disabilities
							.map((d) => disabilityTypeLabels[d.disabilityType])
							.join(", "),
						observation: acceptedRequest.notes ?? "",
						originName: acceptedRequest.originLocation.name,
						destinationName:
							acceptedRequest.destinationLocation.name,
						startedAt: null,
						acceptedAt: new Date().toISOString(),
					});
				}
				utils.requests.pending.invalidate();
				router.push(`/travel?requestId=${variables.requestId}`);
			},
			onError: (error) => {
				console.error("[acceptRequest] Erro:", error.message);
				toast.error("Erro ao aceitar solicitação", {
					description: error.message ?? "Tente novamente mais tarde.",
				});
			},
		});

	// Transformação dos dados da API para o formato da UI
	const pendingServices: Service[] = useMemo(() => {
		return availableRequests.map((req) => ({
			id: req.id,
			student: {
				name:
					req.studentProfile.nickname ??
					`Estudante ${req.studentProfile.id.slice(0, 4)}`,
				disability: req.studentProfile.disabilities
					.map((d) => disabilityTypeLabels[d.disabilityType])
					.join(", "),
				observation: req.notes ?? "",
			},
			route: {
				origin: req.originLocation.name,
				destination: req.destinationLocation.name,
			},
			status: ServiceStatus.Pending,
			createdAt: new Date(req.createdAt),
		}));
	}, [availableRequests]);

	// Transformação do atendimento ativo da API para o formato da UI
	const activeService: Service | null = useMemo(() => {
		if (!activeAttendance) return null;
		return {
			id: activeAttendance.requestId,
			student: {
				name:
					activeAttendance.request.studentProfile.user?.name ??
					`Estudante ${activeAttendance.request.studentProfile.id.slice(0, 4)}`,
				disability: activeAttendance.request.studentProfile.disabilities
					.map((d) => disabilityTypeLabels[d.disabilityType])
					.join(", "),
				observation: activeAttendance.request.notes ?? "",
			},
			route: {
				origin: activeAttendance.request.originLocation.name,
				destination: activeAttendance.request.destinationLocation.name,
			},
			status: ServiceStatus.During,
			startedAt: activeAttendance.startedAt
				? new Date(activeAttendance.startedAt)
				: undefined,
		};
	}, [activeAttendance]);

	// ─── Histórico de atendimentos do turno atual ───────────────────────────

	const { data: shiftHistory } = trpc.requests.scholarHistory.useQuery(
		{ limit: 50 },
		{ enabled: shiftState === "shift_active" },
	);

	// Filtra atendimentos concluídos/cancelados do turno e mapeia para o formato da UI
	const previousServices: Service[] = useMemo(() => {
		if (!shiftHistory?.items) return [];

		const shiftStart = activeShiftLog?.startedAt
			? new Date(activeShiftLog.startedAt).getTime()
			: 0;

		return shiftHistory.items
			.filter(
				(item) =>
					item.completedAt &&
					new Date(item.completedAt).getTime() >= shiftStart,
			)
			.map((item) => ({
				id: item.id,
				student: {
					name:
						item.request.studentProfile.user?.name ??
						`Estudante ${item.request.studentProfile.id.slice(0, 4)}`,
					disability: item.request.studentProfile.disabilities
						?.map((d) => disabilityTypeLabels[d.disabilityType])
						.join(", "),
					observation: item.request.notes ?? "",
				},
				route: {
					origin: item.request.originLocation.name,
					destination: item.request.destinationLocation.name,
				},
				startedAt: item.startedAt
					? new Date(item.startedAt)
					: undefined,
				finishedAt: item.completedAt
					? new Date(item.completedAt)
					: undefined,
				status:
					item.request.status === "cancelled"
						? ServiceStatus.Cancelled
						: ServiceStatus.Concluded,
			}));
	}, [shiftHistory, activeShiftLog]);

	// Dados do atendimento ativo vindos do armazenamento local (fallback instantâneo)
	const persistedActiveService: Service | null = useMemo(() => {
		if (!persistedActive) return null;
		return {
			id: persistedActive.requestId,
			student: {
				name: persistedActive.studentName,
				disability: persistedActive.disability,
				observation: persistedActive.observation,
			},
			route: {
				origin: persistedActive.originName,
				destination: persistedActive.destinationName,
			},
			status: ServiceStatus.During,
			startedAt: persistedActive.startedAt
				? new Date(persistedActive.startedAt)
				: undefined,
		};
	}, [persistedActive]);

	// Usa o dado da API se disponível, senão cai no persistido (instantâneo)
	const currentActiveService = activeService ?? persistedActiveService;

	// Verifica se o turno atual já foi completado hoje.
	// A query roda em todos os estados não-ativos (shift_not_started e
	// not_in_shift). Quando currentShift é null (fora da janela agendada),
	// não passa shift — o backend verifica se *algum* turno foi completado.
	const completedShiftInput = {
		shift: currentShift?.shift as
			| "morning"
			| "afternoon"
			| "night"
			| undefined,
	};
	const {
		data: completedShiftData,
		isLoading: isLoadingCompleted,
		isFetching: isFetchingCompleted,
	} = trpc.shiftLogs.completedShiftForToday.useQuery(completedShiftInput, {
		enabled: shiftState !== "shift_active",
	});

	const isShiftCompleted = completedShiftData?.completed ?? false;

	// ─── Próximo turno agendado (para exibir após completar o atual) ──────

	/**
	 * Encontra o próximo turno agendado para o bolsista, percorrendo os
	 * dias da semana a partir de hoje (até 7 dias à frente).
	 *
	 * Usa o shiftSchedule (definições de horário do sistema) para obter
	 * os horários de início de cada turno, já que a weeklySchedule do
	 * perfil só contém { dayOfWeek, shift }.
	 *
	 * Retorna o primeiro turno encontrado após o horário atual / turno
	 * corrente, ou null se não houver nenhum agendamento futuro.
	 */
	const nextScheduledShift = useMemo(() => {
		const shiftOrder = ["morning", "afternoon", "night"];
		const dayNames = [
			"sunday",
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday",
		];

		const weeklySchedule = me?.scholarProfile?.weeklySchedule;
		if (!weeklySchedule || !shiftSchedule) return null;

		// Mapa rápido: "wednesday:morning" → { startTime, endTime }
		const timeMap = new Map<
			string,
			{ startTime: string; endTime: string }
		>();
		for (const def of shiftSchedule) {
			if (def.isEnabled) {
				timeMap.set(`${def.dayOfWeek}:${def.shift}`, def);
			}
		}

		const now = new Date();
		const todayIndex = now.getDay();
		const currentMinutes = now.getHours() * 60 + now.getMinutes();

		// Varre até 7 dias adiante (a semana se repete)
		for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
			const targetIndex = (todayIndex + dayOffset) % 7;
			const targetDay = dayNames[targetIndex]!;

			const dayEntries = weeklySchedule
				.filter((entry: any) => entry.dayOfWeek === targetDay)
				.sort(
					(a: any, b: any) =>
						shiftOrder.indexOf(a.shift) -
						shiftOrder.indexOf(b.shift),
				);

			for (const entry of dayEntries) {
				const def = timeMap.get(`${targetDay}:${entry.shift}`);
				if (!def) continue;

				const [h, m] = def.startTime.split(":").map(Number);
				// biome-ignore lint/style/noNonNullAssertion: validated by schema (HH:mm)
				const entryStartMinutes = h! * 60 + m!;

				if (dayOffset === 0) {
					// Hoje — descarta turnos que já passaram
					if (currentShift) {
						// Temos um turno corrente: só considera turnos
						// posteriores na ordem (ex.: afternoon > morning)
						if (
							shiftOrder.indexOf(entry.shift) <=
							shiftOrder.indexOf(currentShift.shift)
						) {
							continue;
						}
					} else if (entryStartMinutes <= currentMinutes) {
						// Sem turno corrente: descarta turnos que já
						// começaram
						continue;
					}
				}

				// Dias futuros: qualquer turno agendado vale

				return {
					shift: entry.shift,
					dayOfWeek: targetDay,
					startTime: def.startTime,
					endTime: def.endTime,
				};
			}
		}

		return null;
	}, [me?.scholarProfile?.weeklySchedule, shiftSchedule, currentShift]);

	// ─── Labels dos turnos em português ────────────────────────────────────

	const shiftLabels: Record<string, string> = {
		morning: "Turno matutino",
		afternoon: "Turno vespertino",
		night: "Turno noturno",
	};

	const dayLabels: Record<string, string> = {
		sunday: "Domingo",
		monday: "Segunda-feira",
		tuesday: "Terça-feira",
		wednesday: "Quarta-feira",
		thursday: "Quinta-feira",
		friday: "Sexta-feira",
		saturday: "Sábado",
	};

	const dayNames = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	];

	// Aguarda a verificação de turno completado resolver antes de mostrar
	// os botões de ação. Isso previne que um cache obsoleto
	// ({ completed: false }) exiba o CTA errado enquanto a query refaz o
	// fetch após encerrar um turno.
	const isShiftCheckLoading =
		shiftState !== "shift_active" &&
		completedShiftData === undefined &&
		(isLoadingCompleted || isFetchingCompleted);

	const isLoading = isLoadingShift || isShiftCheckLoading;
	// Handler para iniciar turno
	const handleStartShift = useCallback(() => {
		if (!currentShift) return;
		startShift({
			shift: currentShift.shift as "morning" | "afternoon" | "night",
		});
	}, [currentShift, startShift]);

	// Handler para encerrar turno
	const handleEndShift = useCallback(() => {
		if (!activeShiftLog) return;

		toast("Tem certeza que deseja encerrar o turno?", {
			description:
				"Após encerrar, você não receberá novas solicitações de deslocamento.",
			action: {
				label: "Encerrar turno",
				onClick: () => endShift({ shiftLogId: activeShiftLog.id }),
			},
			cancel: {
				label: "Cancelar",
				onClick: () => {},
			},
			duration: Infinity,
			closeButton: true,
		});
	}, [activeShiftLog, endShift]);

	// Handler para confirmar turno extra — inicia imediatamente sem aprovação
	const handleConfirmExtraShift = useCallback(() => {
		const currentShiftValue = getCurrentShift();

		// Verifica se o bolsista já está registrado para este turno hoje
		if (!BYPASS_EXTRA_VALIDATION) {
			const dayNames = [
				"sunday",
				"monday",
				"tuesday",
				"wednesday",
				"thursday",
				"friday",
				"saturday",
			] as const;
			const today = dayNames[new Date().getDay()]!;

			const isRegistered = me?.scholarProfile?.weeklySchedule?.some(
				(entry) =>
					entry.dayOfWeek === today &&
					entry.shift === currentShiftValue,
			);

			if (isRegistered) {
				toast.warning(
					"Você não pode solicitar um turno extra para o período em que já está registrado na sua grade semanal. Utilize o fluxo regular para iniciar seu turno.",
					{ description: "Turno indisponível" },
				);
				return;
			}
		}

		startShift({
			shift: currentShiftValue,
		});
	}, [startShift, me?.scholarProfile?.weeklySchedule]);

	return (
		<ScrollView
			contentContainerClassName="grow bg-background gap-4"
			showsHorizontalScrollIndicator={false}
		>
			<ScholarHeader
				scholarName={scholarName}
				shiftState={shiftState}
				currentShiftInfo={currentShiftInfo}
				onLongPressLogo={() => devDeleteLatestShiftLog()}
			/>

			<MainContentWrapper>
				{isLoading ? (
					<View className="flex-1 items-center justify-center py-12">
						<ActivityIndicator size="large" />
					</View>
				) : shiftState === "shift_active" ? (
					<>
						<Button
							variant="secondary"
							onPress={handleEndShift}
							disabled={isEndingShift || !!currentActiveService}
							size="lg"
							className="rounded-full gap-3"
						>
							{isEndingShift ? (
								<ActivityIndicator
									size={18}
									color="currentColor"
								/>
							) : (
								<Icon
									icon={Power}
									size={18}
									color="--foreground"
								/>
							)}
							<Text className="mb-0.5 text-base font-medium">
								{isEndingShift
									? "Encerrando..."
									: "Encerrar turno"}
							</Text>
						</Button>

						<View className="gap-4 flex-1">
							{currentActiveService ? (
								<View className="gap-4">
									<SectionTitle label="Atendimento em andamento" />
									<View className="border border-info-border bg-card p-5 gap-4 rounded-xl">
										<View className="flex-row items-start justify-between">
											<View className="flex-row items-center gap-3">
												<Avatar
													alt={`${currentActiveService.student.name}'s Avatar`}
													className="h-12 w-12"
												>
													<AvatarFallback>
														<Text className="font-bold">
															{currentActiveService.student.name
																.split(" ")
																.map(
																	(n) => n[0],
																)
																.join("")
																.slice(0, 2)
																.toUpperCase()}
														</Text>
													</AvatarFallback>
												</Avatar>
												<View>
													<Text className="text-base font-bold text-foreground">
														{
															currentActiveService
																.student.name
														}
													</Text>
													<Text className="text-sm text-muted-foreground">
														{
															currentActiveService
																.student
																.disability
														}
													</Text>
												</View>
											</View>
											<Text className="mt-1 text-xs font-semibold text-info-foreground">
												{currentActiveService.startedAt
													? "Em andamento"
													: "Aguardando encontro"}
											</Text>
										</View>

										<AddressRoute
											from={{
												label: currentActiveService
													.route.origin,
											}}
											to={{
												label: currentActiveService
													.route.destination,
											}}
											shouldShowRoute
											size="lg"
										/>

										{currentActiveService.student
											.observation && (
											<View className="flex-row items-start rounded-sm bg-secondary p-3">
												<Icon
													icon={Info}
													size={16}
													color="--foreground"
												/>
												<Text className="flex-1 text-sm leading-snug text-foreground ml-2">
													{
														currentActiveService
															.student.observation
													}
												</Text>
											</View>
										)}

										<View className="flex-row gap-3">
											<Button
												onPress={() =>
													router.push(
														`/travel?requestId=${currentActiveService.id}`,
													)
												}
												className="w-full"
											>
												<Text className="font-semibold">
													Retomar atendimento
												</Text>
											</Button>
										</View>
									</View>
								</View>
							) : (
								<>
									<SectionTitle label="Aguardando resposta">
										{pendingServices.length > 0 && (
											<Badge variant="warning">
												<Text>
													{pendingServices.length}
													{" pendente"}
												</Text>
											</Badge>
										)}
									</SectionTitle>

									{pendingServices.length > 0 ? (
										<View className="gap-4">
											{pendingServices.map((item) => (
												<PendingRequestCard
													key={item.id}
													service={item}
													onAccept={() =>
														acceptRequest({
															requestId: item.id,
														})
													}
													isAccepting={isAccepting}
												/>
											))}
										</View>
									) : (
										<EmptyStateCard>
											<View className="items-center">
												<Icon
													icon={Palmtree}
													color="--foreground"
													size={56}
												/>
												<Text className="mt-6 mb-3 text-center text-2xl font-bold text-foreground">
													Nenhuma solicitação no
													momento
												</Text>
												<Text className="text-center text-base leading-tight text-muted-foreground">
													Relaxe! Avisaremos você
													quando alguém precisar de
													ajuda.
												</Text>
											</View>
										</EmptyStateCard>
									)}
								</>
							)}

							{previousServices.length > 0 && (
								<PreviousServicesList
									services={previousServices}
								/>
							)}
						</View>
					</>
				) : isShiftCompleted ? (
					<>
						{nextScheduledShift ? (
							<Button
								variant="outline"
								size="lg"
								disabled
								className="rounded-full gap-3 opacity-60"
							>
								<Text className="text-base font-medium">
									{(() => {
										const dayName =
											nextScheduledShift.dayOfWeek;
										const todayName =
											dayNames[new Date().getDay()];
										return dayName === todayName
											? `${shiftLabels[nextScheduledShift.shift] ?? nextScheduledShift.shift} — Pendente`
											: `${dayLabels[dayName] ?? dayName} — ${shiftLabels[nextScheduledShift.shift] ?? nextScheduledShift.shift}`;
									})()}
								</Text>
							</Button>
						) : null}

						<EmptyStateCard>
							<Icon
								icon={CheckCircle2}
								color="--foreground"
								size={56}
							/>
							<Text className="mt-6 mb-3 text-center text-2xl font-bold text-foreground">
								Turno{" "}
								{currentShift?.shift
									? "atual concluído"
									: "já realizado"}
							</Text>
							<Text className="text-center text-base leading-tight text-muted-foreground">
								{nextScheduledShift
									? (() => {
											const dayName =
												nextScheduledShift.dayOfWeek;
											const todayName =
												dayNames[new Date().getDay()];
											if (dayName === todayName) {
												return `Você concluiu seu turno atual.\nEm breve você poderá iniciar seu próximo turno agendado.`;
											}
											return `Você concluiu seu turno atual.\nSeu próximo turno agendado é ${dayLabels[dayName] ?? dayName}.`;
										})()
									: `Você já completou seu turno de hoje.\nNenhum outro turno está agendado para os próximos dias.`}
							</Text>
						</EmptyStateCard>
					</>
				) : shiftState === "shift_not_started" ? (
					<>
						<Button
							variant="default"
							onPress={handleStartShift}
							disabled={isStartingShift}
							size="lg"
							className="rounded-full gap-3"
						>
							{isStartingShift ? (
								<ActivityIndicator size={20} color="white" />
							) : (
								<Icon
									icon={LogIn}
									size={18}
									color="--primary-foreground"
								/>
							)}
							<Text className="mb-0.5 text-base font-medium">
								{isStartingShift
									? "Iniciando..."
									: "Iniciar turno"}
							</Text>
						</Button>

						<EmptyStateCard>
							<Icon icon={Play} color="--foreground" size={56} />
							<Text className="mt-6 mb-3 text-center text-2xl font-bold text-foreground">
								Seu turno já começou!
							</Text>
							<Text className="text-center text-base leading-tight text-muted-foreground">
								Clique em "Iniciar turno" para começar a{"\n"}
								receber solicitações de deslocamento.
							</Text>
						</EmptyStateCard>
					</>
				) : (
					<>
						<Button
							size="lg"
							variant="outline"
							disabled={isStartingShift}
							onPress={() => {
								toast("Solicitação de turno extra", {
									description:
										"Seu turno regular ainda não começou. Caso precise compensar horas pendentes, você pode iniciar um turno extra agora.",
									action: {
										label: "Iniciar turno extra",
										onClick: () =>
											handleConfirmExtraShift(),
									},
									cancel: {
										label: "Cancelar",
										onClick: () => {},
									},
									duration: Infinity,
									closeButton: true,
								});
							}}
							className="rounded-full px-4 gap-2"
						>
							{isStartingShift ? (
								<ActivityIndicator size={20} />
							) : null}
							<Text>
								{isStartingShift
									? "Iniciando..."
									: "Solicitar turno extra"}
							</Text>
						</Button>

						<EmptyStateCard>
							<Icon
								icon={Palmtree}
								color="--foreground"
								size={56}
							/>
							<Text className="mt-6 mb-3 text-center text-2xl font-bold text-foreground">
								Seu turno ainda não{"\n"}começou
							</Text>
							<Text className="text-center text-base leading-tight text-muted-foreground">
								Aguarde o início do seu próximo turno para{"\n"}
								iniciar o expediente no app.
							</Text>
						</EmptyStateCard>
					</>
				)}
			</MainContentWrapper>
		</ScrollView>
	);
}
