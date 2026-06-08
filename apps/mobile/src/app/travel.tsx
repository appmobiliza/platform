import { disabilityTypeLabels } from "@mobiliza/contracts";

import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Clock } from "lucide-react-native";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressRoute } from "@/components/address";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import {
	clearActiveAttendance,
	getActiveAttendance,
	saveActiveAttendance,
} from "@/lib/active-attendance-store";
import { trpc } from "@/lib/trpc/client";

export default function TravelScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	const { requestId } = useLocalSearchParams<{ requestId: string }>();

	// ─── Fetch attendance details ─────────────────────────────────────────────

	const {
		data: attendance,
		isLoading,
		error,
	} = trpc.requests.getAttendanceById.useQuery(
		{ requestId: requestId ?? "" },
		{
			enabled: !!requestId,
		},
	);

	// ─── Mutations ────────────────────────────────────────────────────────────

	const utils = trpc.useUtils();

	const { mutate: startAttendance, isPending: isStarting } =
		trpc.requests.start.useMutation({
			onSuccess: () => {
				// Atualiza o armazenamento local com a data de início
				const current = getActiveAttendance();
				if (current) {
					saveActiveAttendance({
						...current,
						startedAt: new Date().toISOString(),
					});
				}
				utils.requests.getAttendanceById.invalidate({ requestId });
				utils.requests.pending.invalidate();
				utils.requests.active.invalidate();
			},
			onError: (error) => {
				console.error("[startAttendance] Erro:", error.message);
				Alert.alert(
					"Erro ao iniciar atendimento",
					error.message ?? "Tente novamente mais tarde.",
				);
			},
		});

	const { mutate: reportIssue, isPending: isReporting } =
		trpc.requests.reportIssue.useMutation({
			onSuccess: () => {
				clearActiveAttendance();
				utils.requests.getAttendanceById.invalidate({ requestId });
				utils.requests.pending.invalidate();
				// Zera o cache imediatamente para evitar que o efeito na home
				// re-salve o atendimento no armazenamento local com dado obsoleto.
				utils.requests.active.setData(undefined, null);
				utils.requests.scholarHistory.invalidate();
				Alert.alert(
					"Atendimento cancelado",
					"O deslocamento foi cancelado.",
				);
				router.back();
			},
			onError: (error) => {
				console.error("[reportIssue] Erro:", error.message);
				Alert.alert(
					"Erro ao reportar problema",
					error.message ?? "Tente novamente mais tarde.",
				);
			},
		});

	const { mutate: completeAttendance, isPending: isCompleting } =
		trpc.requests.complete.useMutation({
			onSuccess: () => {
				// Remove do armazenamento local ao concluir
				clearActiveAttendance();
				utils.requests.getAttendanceById.invalidate({ requestId });
				utils.shiftLogs.getActiveShift.invalidate();
				// Zera o cache imediatamente para evitar que o efeito na home
				// re-salve o atendimento no armazenamento local com dado obsoleto.
				utils.requests.active.setData(undefined, null);
				utils.requests.scholarHistory.invalidate();
				utils.requests.pending.invalidate();
				Alert.alert(
					"Atendimento concluído",
					"O deslocamento foi finalizado com sucesso.",
				);
				router.back();
			},
			onError: (error) => {
				console.error("[completeAttendance] Erro:", error.message);
				Alert.alert(
					"Erro ao concluir atendimento",
					error.message ?? "Tente novamente mais tarde.",
				);
			},
		});

	// ─── Derived data ─────────────────────────────────────────────────────────

	const studentName = attendance?.request?.studentProfile?.user?.name ?? "";
	const studentInitials = studentName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const disability = attendance?.request?.studentProfile?.disabilities
		?.map((d) => disabilityTypeLabels[d.disabilityType])
		.join(", ");

	const observation = attendance?.request?.notes ?? "";

	const originName = attendance?.request?.originLocation?.name ?? "";
	const destinationName =
		attendance?.request?.destinationLocation?.name ?? "";

	// Determinar se o deslocamento já foi iniciado
	const isDuring = !!attendance?.startedAt;
	const hasCompleted = !!attendance?.completedAt;

	// ─── Handlers ─────────────────────────────────────────────────────────────

	const handleStart = () => {
		if (!requestId) return;
		startAttendance({ requestId });
	};

	const handleComplete = () => {
		if (!requestId) return;
		completeAttendance({ requestId });
	};

	const handleReportProblem = () => {
		if (!requestId) return;
		Alert.alert(
			"Reportar problema",
			"Se houver algum problema com este deslocamento, você pode cancelá-lo.",
			[
				{ text: "Voltar", style: "cancel" },
				{
					text: "Cancelar atendimento",
					style: "destructive",
					onPress: () => reportIssue({ requestId }),
				},
			],
		);
	};

	// ─── Loading / Error ──────────────────────────────────────────────────────

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (error || !attendance) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<Text className="text-lg font-bold text-foreground mb-2">
					Atendimento não encontrado
				</Text>
				<Text className="text-muted-foreground text-center mb-6">
					{error?.message ??
						"Não foi possível carregar os dados do atendimento."}
				</Text>
				<Button onPress={() => router.back()}>
					<Text>Voltar</Text>
				</Button>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			{/* Header */}
			<View
				className="bg-primary px-6 pb-8 gap-6"
				style={{ paddingTop: insets.top + 24 }}
			>
				{/* Top Nav */}
				<View className="flex-row items-center justify-between">
					<ChevronLeft
						color="#FFFFFF"
						size={32}
						onPress={() => router.back()}
					/>

					{/* Timer (only while in progress) */}
					{isDuring && !hasCompleted && (
						<View className="bg-primary-foreground/20 px-3 py-1.5 rounded-full flex-row items-center">
							<Clock
								color="#FFFFFF"
								size={14}
								className="mr-1.5"
							/>
							<Text className="text-primary-foreground text-sm mb-0.5 font-semibold">
								Em andamento
							</Text>
						</View>
					)}
				</View>

				{/* Student Profile Info */}
				<View className="flex-row items-center">
					<Avatar
						alt={`${studentName}'s Avatar`}
						className="h-16 w-16 mr-4"
					>
						<AvatarFallback>
							<Text>{studentInitials}</Text>
						</AvatarFallback>
					</Avatar>
					<View>
						<Text className="font-bold text-2xl text-primary-foreground">
							{studentName}
						</Text>
						{disability && (
							<Text className="text-primary-foreground/80 font-medium">
								{disability}
							</Text>
						)}
					</View>
				</View>
			</View>

			<ScrollView
				className="flex-1 px-6 pt-6"
				contentContainerClassName="gap-4"
				showsVerticalScrollIndicator={false}
			>
				{/* Route Card */}
				<View className="p-5 bg-card border border-border rounded-lg">
					<Text className="text-muted-foreground font-semibold text-xs mb-3 tracking-widest uppercase">
						PERCURSO
					</Text>
					<AddressRoute
						from={{
							label: originName,
							description: "Ponto de partida",
						}}
						to={{
							label: destinationName,
							description: "Destino",
						}}
						shouldShowRoute
						size="lg"
					/>
				</View>

				{/* Observation Card */}
				{observation && (
					<View className="bg-card p-4 border border-border rounded-lg">
						<Text className="text-muted-foreground font-semibold text-xs mb-3 tracking-widest uppercase">
							OBSERVAÇÃO DO ESTUDANTE
						</Text>
						<Text className="text-foreground leading-relaxed font-medium">
							"{observation}"
						</Text>
					</View>
				)}
			</ScrollView>

			{/* Footer Actions */}
			<View className="px-6 pb-8 pt-4 gap-2">
				{hasCompleted ? (
					<Button
						size="lg"
						onPress={() => router.back()}
						className="w-full rounded-xl"
					>
						<Text>Voltar ao início</Text>
					</Button>
				) : isDuring ? (
					<Button
						size="lg"
						onPress={handleComplete}
						disabled={isCompleting}
						className="w-full rounded-xl"
					>
						{isCompleting ? (
							<ActivityIndicator size={20} color="white" />
						) : (
							<Text>Concluir atendimento</Text>
						)}
					</Button>
				) : (
					<Button
						size="lg"
						onPress={handleStart}
						disabled={isStarting}
						className="w-full rounded-xl"
					>
						{isStarting ? (
							<ActivityIndicator size={20} color="white" />
						) : (
							<Text>Aguardando encontro...</Text>
						)}
					</Button>
				)}

				{!hasCompleted && (
					<Button
						variant="outline"
						className="bg-transparent dark:bg-transparent"
						size={"lg"}
						onPress={handleReportProblem}
						disabled={isReporting}
					>
						{isReporting ? (
							<ActivityIndicator size={20} color={"white"} />
						) : (
							<Text>Reportar problema</Text>
						)}
					</Button>
				)}
			</View>
		</View>
	);
}
