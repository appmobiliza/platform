import { useLocalSearchParams } from "expo-router";
import { Clock, ClockAlert } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

import { HistoryDetailLayout } from "@/layout/history-details";

import ScholarHistoryDetails from "@/components/scholar/history-details";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useLightStatusBar } from "@/hooks/use-light-status-bar";

import { useUserRole } from "@/lib/auth/store";
import { formatDateTime, formatTime } from "@/lib/date";
import { trpc } from "@/lib/trpc/client";

function StudentHistoryDetails() {
	useLightStatusBar();

	const { id } = useLocalSearchParams<{ id: string }>();

	const { data } = trpc.requests.studentHistory.useInfiniteQuery(
		{ limit: 50 },
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);

	const request = useMemo(() => {
		if (!data) return null;
		const allItems = data.pages.flatMap((page) => page.items);
		return allItems.find((item) => item.id === id) ?? null;
	}, [data, id]);

	if (!request) {
		return (
			<View className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	const originName = request.originLocation?.name ?? "Origem";
	const destinationName = request.destinationLocation?.name ?? "Destino";
	const title = `${originName} → ${destinationName}`;
	const subtitle = formatDateTime(new Date(request.createdAt));

	const isUnattended = request.status === "unattended";
	const isCancelled = request.status === "cancelled";

	// Para unattended/cancelled não há attendance
	const attendance = request.attendance;
	const scholarUser = attendance?.scholarProfile?.user;
	const scholarName = scholarUser?.name ?? "Bolsista";
	const scholarInitials = scholarName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const durationSeconds = attendance?.durationSeconds ?? null;
	const durationMinutes = durationSeconds
		? Math.round(durationSeconds / 60)
		: null;

	// Para solicitações não atendidas, mostrar um badge de status
	const statusBadge = isUnattended ? (
		<Badge variant="destructive">
			<Icon
				icon={ClockAlert}
				size={14}
				color="--destructive-foreground"
			/>
			<Text>Não atendida</Text>
		</Badge>
	) : isCancelled ? (
		<Badge variant="secondary">
			<Text>Cancelada</Text>
		</Badge>
	) : durationMinutes ? (
		<Badge>
			<Icon icon={Clock} size={14} color="--primary-foreground" />
			<Text>{durationMinutes}m</Text>
		</Badge>
	) : null;

	const hasLocations =
		!!request.originLocation?.latitude &&
		!!request.originLocation?.longitude &&
		!!request.destinationLocation?.latitude &&
		!!request.destinationLocation?.longitude;

	return (
		<HistoryDetailLayout
			title={title}
			subtitle={subtitle}
			mapOrigin={
				hasLocations
					? {
							latitude: request.originLocation.latitude,
							longitude: request.originLocation.longitude,
						}
					: null
			}
			mapDestination={
				hasLocations
					? {
							latitude: request.destinationLocation.latitude,
							longitude: request.destinationLocation.longitude,
						}
					: null
			}
			mapBadges={statusBadge}
			profile={
				isUnattended || isCancelled ? (
					<View className="flex-row items-center gap-3 py-3">
						<View className="size-10 items-center justify-center rounded-full bg-muted">
							<Icon
								icon={ClockAlert}
								size={20}
								color="--muted-foreground"
							/>
						</View>
						<View className="flex-1">
							<Text className="font-medium text-sm text-muted-foreground">
								{isUnattended
									? "Nenhum contribuinte aceitou a solicitação"
									: "Solicitação cancelada"}
							</Text>
						</View>
					</View>
				) : (
					<View className="flex-row items-center gap-3">
						<Avatar alt={`Avatar de ${scholarName}`}>
							{scholarUser?.image ? (
								<AvatarImage
									source={{
										uri: scholarUser.image,
									}}
								/>
							) : null}
							<AvatarFallback>
								<Text>{scholarInitials}</Text>
							</AvatarFallback>
						</Avatar>
						<View className="flex-1">
							<Text className="font-medium text-sm">
								Atendido por{" "}
								<Text className="font-semibold text-sm">
									{scholarName}
								</Text>
							</Text>
						</View>
					</View>
				)
			}
			route={{
				className: "w-full",
				from: {
					label: originName,
					className: "px-3 py-4",
					children: (
						<Text className="text-xs font-medium text-muted-foreground">
							{formatTime(new Date(request.createdAt))}
						</Text>
					),
				},
				to: {
					label: destinationName,
					className: "px-3 py-4",
					children: attendance?.completedAt ? (
						<Text className="text-xs font-medium text-muted-foreground">
							{formatTime(new Date(attendance.completedAt))}
						</Text>
					) : null,
				},
			}}
		>
			{/* Ações opcionais para solicitações não atendidas/canceladas
			podem ser adicionadas aqui no futuro */}
		</HistoryDetailLayout>
	);
}

export default function HistoryDetails() {
	const role = useUserRole();
	const { id } = useLocalSearchParams<{ id: string }>();

	if (role === "scholar") {
		return <ScholarHistoryDetailsPage id={id} />;
	}

	return <StudentHistoryDetails />;
}

function ScholarHistoryDetailsPage({ id }: { id: string }) {
	const { data } = trpc.requests.scholarHistory.useInfiniteQuery(
		{ limit: 50 },
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);

	const attendance = useMemo(() => {
		if (!data) return null;
		const allItems = data.pages.flatMap((page) => page.items);
		return allItems.find((item) => item.id === id) ?? null;
	}, [data, id]);

	if (!attendance) {
		return (
			<View className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return <ScholarHistoryDetails attendance={attendance} />;
}
