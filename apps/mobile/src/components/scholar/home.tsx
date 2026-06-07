import { useRouter } from "expo-router";
import { Clock, MapPin, Palmtree, Power } from "lucide-react-native";
import { type ReactNode, useMemo, useState } from "react";
import { FlatList, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

import { Logo } from "@/assets/logo";

import {
	PendingRequestCard,
	type Service,
	ServiceStatus,
} from "./pending-request-card";

type ShiftState = "off-duty" | "during";

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

const shifts = [
	{
		id: "morning",
		label: "Turno matutino",
		time: "07h - 12h",
	},
	{
		id: "afternoon",
		label: "Turno vespertino",
		time: "12h - 17h",
	},
	{
		id: "evening",
		label: "Turno noturno",
		time: "17h - 22h",
	},
];

type Shift = (typeof shifts)[number];

function ShiftPill({ shift }: { shift: Shift }) {
	return (
		<View className="flex-row items-center justify-between rounded-lg bg-black/20 px-4 py-3">
			<View className="flex-row items-center">
				<Clock color="#FFFFFF" size={18} />
				<Text className="ml-3 text-base font-medium text-primary-foreground">
					{shift.label}
				</Text>
			</View>
			<Text className="text-base text-primary-foreground">
				{shift.time}
			</Text>
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

// Mantemos o mock apenas para o histórico por enquanto, até implementarmos a query de histórico
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
		startedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutos atrás
		finishedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
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
		startedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutos atrás
		finishedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
	},
];

export function ScholarHome() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const [shiftState, setShiftState] = useState<ShiftState>("during");

	// Dados reais do backend
	const { data: availableRequests = [] } = trpc.requests.pending.useQuery(
		undefined,
		{
			enabled: shiftState === "during",
		},
	);

	// Nota: Atualizações em tempo real serão integradas via RealtimeClientAdapter
	// (Supabase/Ably/WebSocket) quando implementado.
	// Por enquanto, as solicitações pendentes são atualizadas manualmente.
	const utils = trpc.useUtils();

	// Transformação de dados do tRPC para o formato esperado pelo componente UI
	const pendingServices: Service[] = useMemo(() => {
		return availableRequests.map((req) => ({
			id: req.id,
			student: {
				// Usa o nickname ou fallback, já que o PII foi ocultado
				name:
					req.studentProfile.nickname ??
					`Estudante ${req.studentProfile.id.slice(0, 4)}`,
				disability: req.studentProfile.attendanceNotes ?? "PcD", // Fallback enquanto não temos o campo de deficiência real no perfil
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

	const currentDate = new Date();
	const isInShift =
		currentDate.getHours() >= 7 && currentDate.getHours() < 19;
	const remainingTime =
		currentDate.getHours() < 7
			? new Date(
					currentDate.getFullYear(),
					currentDate.getMonth(),
					currentDate.getDate(),
					7,
					0,
					0,
				).getTime() - currentDate.getTime()
			: new Date(
					currentDate.getFullYear(),
					currentDate.getMonth(),
					currentDate.getDate() + 1,
					7,
					0,
					0,
				).getTime() - currentDate.getTime();
	const hours = Math.floor(remainingTime / (1000 * 60 * 60));

	const _shiftStarted = shiftState === "during";

	return (
		<ScrollView contentContainerClassName="flex-1 bg-background gap-4">
			<View
				className="bg-primary px-4 pb-4 gap-4"
				style={{ paddingTop: insets.top + 24 }}
			>
				<View className="flex-row items-center justify-between">
					<View className="flex-col items-start justify-start ">
						<Text
							className="text-sm font-medium text-primary-foreground mb-2"
							onPress={() => setShiftState("during")}
						>
							Olá, Isabela 👋
						</Text>
						<Logo fill="#FFFFFF" height={28} width={160} />
					</View>

					<Badge className="bg-accent py-1 px-2.5">
						<View
							className={cn("mr-1 h-1.5 w-1.5 rounded-full", {
								"bg-green-500": isInShift,
								"bg-red-500": !isInShift,
							})}
						/>
						<Text className="text-sm font-medium text-white leading-none mb-0.5">
							{isInShift ? "Disponível" : "Fora do turno"}
						</Text>
					</Badge>
				</View>

				<ShiftPill shift={shifts[0]!} />
			</View>

			<MainContentWrapper>
				{shiftState === "off-duty" ? (
					<>
						<Button
							size="lg"
							disabled
							className="rounded-full px-4"
						>
							<Text>Próximo turno começa em {hours}h</Text>
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
								Aguarde o início do seu turno para{"\n"}
								visualizar as solicitações
							</Text>
						</EmptyStateCard>
					</>
				) : (
					<>
						<Button
							variant="secondary"
							onPress={() => {
								setShiftState("off-duty");
							}}
							size="lg"
							className="rounded-full gap-3"
						>
							<Power
								size={20}
								color="currentColor"
								className="text-foreground"
							/>
							<Text className="mb-0.5 text-base font-medium">
								Encerrar turno
							</Text>
						</Button>

						<View className="gap-4">
							<SectionTitle label="Aguardando resposta">
								<Badge variant="warning">
									<Text>
										{pendingServices.length}
										{" pendente"}
									</Text>
								</Badge>
							</SectionTitle>

							{pendingServices.length > 0 ? (
								<FlatList
									data={pendingServices}
									renderItem={({ item }) => (
										<PendingRequestCard
											key={item.id}
											service={item}
											onAccept={() =>
												router.push("/travel")
											}
											onReject={() => undefined}
										/>
									)}
									keyExtractor={(item) => item.id}
								/>
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

							<PreviousServicesList
								services={historicalServicesMock}
							/>
						</View>
					</>
				)}
			</MainContentWrapper>
		</ScrollView>
	);
}
