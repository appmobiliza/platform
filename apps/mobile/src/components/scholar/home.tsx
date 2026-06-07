import { disabilityTypeLabels, getCurrentShift } from "@mobiliza/contracts";

import { useRouter } from "expo-router";
import {
	Calendar,
	Clock,
	LogIn,
	MapPin,
	Palmtree,
	Play,
	Power,
} from "lucide-react-native";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	ScrollView,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RequestExtraShiftDialog } from "@/components/request-extra-shift-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { getRealtimeClient } from "@/lib/realtime";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

import { Logo } from "@/assets/logo";

import {
	PendingRequestCard,
	type Service,
	ServiceStatus,
} from "./pending-request-card";

// ─── Tipos ───────────────────────────────────────────────────────────────────

/**
 * Estado de turno do bolsista na tela inicial.
 *
 * - "not_in_shift": Fora do horário de turno (pode solicitar turno extra)
 * - "shift_not_started": Dentro do horário de turno mas ainda não iniciou no app
 * - "shift_active": Turno iniciado (pode ver solicitações pendentes)
 */
type ShiftState = "not_in_shift" | "shift_not_started" | "shift_active";

/**
 * Mapa de labels dos turnos em português.
 */
const shiftLabels: Record<string, string> = {
	morning: "Turno matutino",
	afternoon: "Turno vespertino",
	night: "Turno noturno",
};

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function EmptyStateCard({ children }: { children: ReactNode }) {
	return (
		<View className="flex-1 items-center justify-center rounded-2xl border border-border p-6">
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

function ShiftPill({ label, time }: { label: string; time: string }) {
	return (
		<View className="flex-row items-center justify-between rounded-lg bg-black/20 px-4 py-3">
			<View className="flex-row items-center">
				<Clock color="#FFFFFF" size={18} />
				<Text className="ml-3 text-base font-medium text-primary-foreground">
					{label}
				</Text>
			</View>
			<Text className="text-base text-primary-foreground">{time}</Text>
		</View>
	);
}

function PreviousServicesList({ services }: { services?: Service[] }) {
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
								<Badge variant="success">
									<Text>Concluído</Text>
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
					);
				}}
			/>
		</View>
	);
}

// Mantemos o mock apenas para o histórico por enquanto
const historicalServicesMock: Service[] = [
	{
		id: "2",
		student: {
			name: "João Victor",
			disability: "Mobilidade reduzida",
			observation:
				"Solicitou apoio para trajeto com menor circulação de pessoas",
		},
		route: {
			origin: "Reitoria",
			destination: "Restaurante Universitário",
		},
		status: ServiceStatus.Concluded,
		startedAt: new Date(Date.now() - 45 * 60 * 1000),
		finishedAt: new Date(Date.now() - 15 * 60 * 1000),
	},
	{
		id: "3",
		student: {
			name: "Camila Souza",
			disability: "Deficiência auditiva",
			observation:
				"Necessita comunicação visual clara durante o percurso",
		},
		route: {
			origin: "Centro de Vivência",
			destination: "Faculdade de Letras",
		},
		status: ServiceStatus.Concluded,
		startedAt: new Date(Date.now() - 45 * 60 * 1000),
		finishedAt: new Date(Date.now() - 15 * 60 * 1000),
	},
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Determina em qual turno estamos baseado nos horários configurados.
 * Usa os shift definitions do backend ou fallback para horários padrão.
 */
function getCurrentShiftFromSchedule(
	definitions: Array<{
		shift: string;
		dayOfWeek: string;
		startTime: string;
		endTime: string;
		isEnabled: boolean;
	}>,
): { shift: string; startTime: string; endTime: string } | null {
	const now = new Date();
	const dayNames = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	];
	const currentDay = dayNames[now.getDay()]!;
	const currentMinutes = now.getHours() * 60 + now.getMinutes();

	const todayDefinitions = definitions.filter(
		(def) => def.dayOfWeek === currentDay && def.isEnabled,
	);

	for (const def of todayDefinitions) {
		const [startH, startM] = def.startTime.split(":").map(Number);
		const [endH, endM] = def.endTime.split(":").map(Number);
		const startMinutes = startH! * 60 + startM!;
		const endMinutes = endH! * 60 + endM!;

		if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
			return {
				shift: def.shift,
				startTime: def.startTime,
				endTime: def.endTime,
			};
		}
	}

	return null;
}

/**
 * Retorna uma representação legível do horário.
 */
function formatTimeRange(startTime: string, endTime: string): string {
	const fmt = (t: string) => {
		const [h, m] = t.split(":");
		return `${h}h${m !== "00" ? m : ""}`;
	};
	return `${fmt(startTime)} - ${fmt(endTime)}`;
}

// ─── Componente principal ────────────────────────────────────────────────────

export function ScholarHome() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	// ─── Queries ─────────────────────────────────────────────────────────────

	// Dados do perfil do usuário logado
	const { data: me } = trpc.profiles.me.useQuery();

	// Definições de turno (horários configurados pelo gestor)
	const { data: shiftSchedule = [] } =
		trpc.settings.getShiftSchedule.useQuery();

	// Turno ativo do bolsista
	const { data: activeShiftLog, isLoading: isLoadingShift } =
		trpc.shiftLogs.getActiveShift.useQuery();

	// Solicitações pendentes (só busca quando o turno está ativo)
	const { data: availableRequests = [] } = trpc.requests.pending.useQuery(
		undefined,
		{
			enabled: activeShiftLog !== null && activeShiftLog !== undefined,
		},
	);

	// ─── Estado do diálogo de turno extra ──────────────────────────────────

	const [extraShiftDialogOpen, setExtraShiftDialogOpen] = useState(false);

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
			return client.subscribe("requests:pending", "request:new", () => {
				// Invalida a query de pendentes para re-buscar
				// e mostrar a nova solicitação imediatamente
				utils.requests.pending.invalidate();
			});
		});

		return () => {
			unsubPromise.then((unsub) => unsub());
		};
	}, [activeShiftLog, utils.requests.pending]);

	const { mutate: startShift, isPending: isStartingShift } =
		trpc.shiftLogs.startShift.useMutation({
			onSuccess: () => {
				setExtraShiftDialogOpen(false);
				utils.shiftLogs.getActiveShift.invalidate();
				utils.profiles.me.invalidate();
			},
			onError: (error) => {
				console.error("[startShift] Erro:", error.message);
				Alert.alert(
					"Erro ao iniciar turno",
					error.message ?? "Tente novamente mais tarde.",
				);
			},
		});

	const { mutate: endShift, isPending: isEndingShift } =
		trpc.shiftLogs.endShift.useMutation({
			onSuccess: () => {
				utils.shiftLogs.getActiveShift.invalidate();
				utils.profiles.me.invalidate();
			},
		});

	// ─── Determinar estado do turno ──────────────────────────────────────────

	const currentShift = useMemo(
		() => getCurrentShiftFromSchedule(shiftSchedule as any[]),
		[shiftSchedule],
	);

	const shiftState: ShiftState = useMemo(() => {
		if (activeShiftLog) return "shift_active";
		if (currentShift) return "shift_not_started";
		return "not_in_shift";
	}, [activeShiftLog, currentShift]);

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

	// Nome do bolsista
	const scholarName = useMemo(() => {
		return me?.name?.split(" ")[0] ?? "Bolsista";
	}, [me]);

	// Horário do turno atual
	const currentShiftInfo = useMemo(() => {
		if (currentShift) {
			return {
				label: shiftLabels[currentShift.shift] ?? currentShift.shift,
				time: formatTimeRange(
					currentShift.startTime,
					currentShift.endTime,
				),
			};
		}
		return null;
	}, [currentShift]);

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
		endShift({ shiftLogId: activeShiftLog.id });
	}, [activeShiftLog, endShift]);

	// Handler para confirmar turno extra — inicia imediatamente sem aprovação
	const handleConfirmExtraShift = useCallback(() => {
		const currentShiftValue = getCurrentShift();
		startShift({
			shift: currentShiftValue,
		});
	}, [startShift]);

	const isLoading = isLoadingShift;

	return (
		<ScrollView contentContainerClassName="flex-1 bg-background gap-4">
			<View
				className="bg-primary px-4 pb-4 gap-4"
				style={{ paddingTop: insets.top + 24 }}
			>
				<View className="flex-row items-center justify-between">
					<View className="flex-col items-start justify-start">
						<Text className="text-sm font-medium text-primary-foreground mb-2">
							Olá, {scholarName} 👋
						</Text>
						<Logo fill="#FFFFFF" height={28} width={160} />
					</View>

					<Badge
						className={cn("py-1 px-2.5", {
							"bg-green-600": shiftState === "shift_active",
							"bg-yellow-600": shiftState === "shift_not_started",
							"bg-muted-foreground":
								shiftState === "not_in_shift",
						})}
					>
						<View
							className={cn("mr-1 h-1.5 w-1.5 rounded-full", {
								"bg-green-300": shiftState === "shift_active",
								"bg-yellow-300":
									shiftState === "shift_not_started",
								"bg-red-300": shiftState === "not_in_shift",
							})}
						/>
						<Text className="text-sm font-medium text-white leading-none mb-0.5">
							{shiftState === "shift_active"
								? "Em turno"
								: shiftState === "shift_not_started"
									? "Iniciar turno"
									: "Fora do turno"}
						</Text>
					</Badge>
				</View>

				{currentShiftInfo && (
					<ShiftPill
						label={currentShiftInfo.label}
						time={currentShiftInfo.time}
					/>
				)}
			</View>

			<MainContentWrapper>
				{isLoading ? (
					<View className="flex-1 items-center justify-center py-12">
						<ActivityIndicator size="large" />
					</View>
				) : shiftState === "not_in_shift" ? (
					<>
						{/* Fora do turno — pode solicitar turno extra */}
						<Button
							size="lg"
							variant="outline"
							onPress={() => setExtraShiftDialogOpen(true)}
							className="rounded-full px-4 gap-2"
						>
							<Text>Solicitar turno extra</Text>
						</Button>

						<RequestExtraShiftDialog
							open={extraShiftDialogOpen}
							onOpenChange={setExtraShiftDialogOpen}
							onConfirm={handleConfirmExtraShift}
							onCancel={() => setExtraShiftDialogOpen(false)}
							isLoading={isStartingShift}
						/>

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
				) : shiftState === "shift_not_started" ? (
					<>
						{/* Dentro do horário de turno mas não iniciou no app */}
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
						{/* Turno ativo — pode ver solicitações */}
						<Button
							variant="secondary"
							onPress={handleEndShift}
							disabled={isEndingShift}
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
							<SectionTitle label="Aguardando resposta">
								<Badge variant="warning">
									<Text>
										{pendingServices.length}
										{" pendente"}
									</Text>
								</Badge>
							</SectionTitle>

							{pendingServices.length > 0 ? (
								<View className="gap-4">
									{pendingServices.map((item) => (
										<PendingRequestCard
											key={item.id}
											service={item}
											onAccept={() =>
												router.push("/travel")
											}
											onReject={() => undefined}
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
											Nenhuma solicitação no momento
										</Text>
										<Text className="text-center text-base leading-tight text-muted-foreground">
											Relaxe! Avisaremos você quando
											alguém precisar de ajuda.
										</Text>
									</View>
								</EmptyStateCard>
							)}

							{/*<PreviousServicesList
								services={historicalServicesMock}
							/>*/}
						</View>
					</>
				)}
			</MainContentWrapper>
		</ScrollView>
	);
}
