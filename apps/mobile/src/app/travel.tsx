import { disabilityTypeLabels } from "@mobiliza/contracts";

import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Clock, MapIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressRoute } from "@/components/address";
import MapView from "@/components/map/map-view";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useOsrmRoute } from "@/hooks/use-osrm-route";
import { usePositionBroadcaster } from "@/hooks/use-position-broadcaster";
import { useStudentTripPosition } from "@/hooks/use-student-trip-position";
import { useUserLocation } from "@/hooks/use-user-location";
import {
	clearActiveAttendance,
	getActiveAttendance,
	saveActiveAttendance,
} from "@/lib/active-attendance-store";
import { haversineMeters } from "@/lib/distance";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

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
				clearActiveAttendance();
				utils.requests.getAttendanceById.invalidate({ requestId });
				utils.shiftLogs.getActiveShift.invalidate();
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

	const originCoords = attendance?.request?.originLocation
		? {
				latitude: attendance.request.originLocation.latitude,
				longitude: attendance.request.originLocation.longitude,
			}
		: null;

	const destinationCoords = attendance?.request?.destinationLocation
		? {
				latitude: attendance.request.destinationLocation.latitude,
				longitude: attendance.request.destinationLocation.longitude,
			}
		: null;

	// Determinar se o deslocamento já foi iniciado
	const isDuring = !!attendance?.startedAt;
	const hasCompleted = !!attendance?.completedAt;

	// ─── Scholar location tracking ────────────────────────────────────────────

	const userLocation = useUserLocation({ enabled: !hasCompleted });

	// ─── Broadcast scholar position to realtime channels ─────────────────────
	// Student sees this during the trip via useScholarTripPosition
	usePositionBroadcaster({
		enabled: !!requestId && !hasCompleted,
		location: userLocation,
		requestId,
	});

	// ─── Subscribe to student position (so scholar can see student on map) ────
	const { studentPosition } = useStudentTripPosition({
		enabled: !!requestId && !hasCompleted,
		requestId,
	});

	// ─── Distances ────────────────────────────────────────────────────────────

	const distanceToOrigin = useMemo(() => {
		if (!userLocation || !originCoords) return null;
		return haversineMeters(
			userLocation.latitude,
			userLocation.longitude,
			originCoords.latitude,
			originCoords.longitude,
		);
	}, [userLocation, originCoords]);

	const distanceToDestination = useMemo(() => {
		if (!userLocation || !destinationCoords) return null;
		return haversineMeters(
			userLocation.latitude,
			userLocation.longitude,
			destinationCoords.latitude,
			destinationCoords.longitude,
		);
	}, [userLocation, destinationCoords]);

	const isCloseToStudent =
		distanceToOrigin !== null && distanceToOrigin <= 100;
	const isFarFromDestination =
		isDuring &&
		distanceToDestination !== null &&
		distanceToDestination > 100;

	// ─── Map state ────────────────────────────────────────────────────────────

	const [showMap, setShowMap] = useState(false);

	// ─── Route path for map (OSRM) ────────────────────────────────────────

	const routeTarget = useMemo(() => {
		if (!isDuring) return originCoords;
		return destinationCoords;
	}, [isDuring, originCoords, destinationCoords]);

	const { route: osrmRoute } = useOsrmRoute({
		origin:
			showMap && userLocation
				? [userLocation.longitude, userLocation.latitude]
				: null,
		destination:
			showMap && routeTarget
				? [routeTarget.longitude, routeTarget.latitude]
				: null,
		enabled: showMap && !!userLocation && !!routeTarget,
	});

	const routePath = osrmRoute?.geometry.coordinates as
		| Array<[number, number]>
		| undefined;

	// ─── Handlers ─────────────────────────────────────────────────────────────

	const handleStart = () => {
		if (!requestId) return;
		startAttendance({ requestId });
	};

	const handleComplete = () => {
		if (!requestId) return;
		completeAttendance({ requestId });
	};

	const handleRequest = () => {
		if (hasCompleted) {
			router.back();
			return;
		}

		if (isDuring) {
			// Concluir atendimento
			if (isFarFromDestination) {
				Alert.alert(
					"Atenção",
					"Você ainda está distante do destino. Deseja concluir o atendimento mesmo assim?",
					[
						{ text: "Cancelar", style: "cancel" },
						{
							text: "Concluir",
							style: "destructive",
							onPress: handleComplete,
						},
					],
				);
			} else {
				handleComplete();
			}
			return;
		}

		// Iniciar atendimento
		if (!isCloseToStudent) {
			Alert.alert(
				"Atenção",
				"Você ainda está distante do estudante. Deseja iniciar o atendimento mesmo assim?",
				[
					{ text: "Cancelar", style: "cancel" },
					{
						text: "Iniciar",
						style: "destructive",
						onPress: handleStart,
					},
				],
			);
		} else {
			handleStart();
		}
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

	// ─── Button derived props ─────────────────────────────────────────────────

	const isPending = isStarting || isCompleting;

	let buttonText: string;
	if (hasCompleted) {
		buttonText = "Voltar ao início";
	} else if (isDuring) {
		buttonText = "Concluir atendimento";
	} else if (isCloseToStudent) {
		buttonText = "Iniciar atendimento";
	} else {
		buttonText = "Aguardando encontro...";
	}

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

				{/* Map area when toggled */}
				{showMap && (
					<View className="h-64 rounded-lg overflow-hidden border border-border">
						<MapView
							stage="trip"
							origin={
								originCoords
									? {
											name: originName,
											latitude: originCoords.latitude,
											longitude: originCoords.longitude,
										}
									: undefined
							}
							destination={
								destinationCoords
									? {
											name: destinationName,
											latitude:
												destinationCoords.latitude,
											longitude:
												destinationCoords.longitude,
										}
									: undefined
							}
							routePath={routePath}
							showUserLocation
							studentPosition={studentPosition}
						/>
					</View>
				)}
			</ScrollView>

			{/* Footer Actions */}
			<View className="px-6 pb-8 pt-4 gap-2">
				{/* Map toggle */}
				{!hasCompleted && (
					<Button
						variant="outline"
						size="sm"
						onPress={() => setShowMap((prev) => !prev)}
						className="w-full rounded-xl"
					>
						<Icon icon={MapIcon} size={16} color="--primary" />
						<Text className="ml-2">
							{showMap ? "Ocultar mapa" : "Ver no mapa"}
						</Text>
					</Button>
				)}

				{/* Main action button (unified) */}
				<Button
					size="lg"
					onPress={handleRequest}
					disabled={isPending}
					className={cn("w-full rounded-xl", {
						"opacity-50": isDuring && isFarFromDestination,
					})}
				>
					{isPending ? (
						<ActivityIndicator size={20} color="white" />
					) : (
						<Text>{buttonText}</Text>
					)}
				</Button>

				{!hasCompleted && (
					<Button
						variant="outline"
						className="bg-transparent dark:bg-transparent"
						size="lg"
						onPress={handleReportProblem}
						disabled={isReporting}
					>
						{isReporting ? (
							<ActivityIndicator size={20} color="white" />
						) : (
							<Text>Reportar problema</Text>
						)}
					</Button>
				)}
			</View>
		</View>
	);
}
