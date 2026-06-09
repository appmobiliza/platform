import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

import { Header } from "@/components/header";
import { SimpleHistoryItem } from "@/components/simple-history-item";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";

import { useLightStatusBar } from "@/hooks/use-light-status-bar";
import { getDateKey } from "@/lib/date";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

export default function ScholarShiftDetails() {
	useLightStatusBar();

	const { id: dateKey } = useLocalSearchParams<{ id: string }>();

	const { data, isLoading } = trpc.requests.scholarHistory.useInfiniteQuery(
		{ limit: 50 },
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);

	const allItems = useMemo(
		() => data?.pages.flatMap((page) => page.items) ?? [],
		[data],
	);

	const dayAttendances = useMemo(
		() =>
			allItems.filter((item) => {
				const itemDateKey = getDateKey(new Date(item.acceptedAt));
				return itemDateKey === dateKey;
			}),
		[allItems, dateKey],
	);

	const dateLabel = useMemo(() => {
		if (dayAttendances.length === 0 || !dayAttendances[0]) return dateKey;
		const date = new Date(dayAttendances[0].acceptedAt);
		const monthNames = [
			"janeiro",
			"fevereiro",
			"março",
			"abril",
			"maio",
			"junho",
			"julho",
			"agosto",
			"setembro",
			"outubro",
			"novembro",
			"dezembro",
		];
		return `${date.getDate()} de ${monthNames[date.getMonth()]}`;
	}, [dayAttendances, dateKey]);

	if (isLoading) {
		return (
			<View className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<Header title={dateLabel} />

			<Text className="font-semibold text-xl mt-4 pl-4">
				{dayAttendances.length} deslocamento
				{dayAttendances.length !== 1 ? "s" : ""}
			</Text>

			<FlatList
				data={dayAttendances}
				keyExtractor={(item) => item.id}
				renderItem={({ item, index }) => {
					const originLabel =
						item.request.originLocation?.name ?? "Origem";
					const destinationLabel =
						item.request.destinationLocation?.name ?? "Destino";
					const title = `${originLabel} → ${destinationLabel}`;
					const studentName =
						item.request.studentProfile?.user?.name ?? "Estudante";
					const studentInitials = studentName
						.split(" ")
						.map((n) => n[0])
						.join("")
						.slice(0, 2)
						.toUpperCase();

					const fmt = (d: Date) =>
						`${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
					const startTime = item.startedAt
						? fmt(new Date(item.startedAt))
						: item.acceptedAt
							? fmt(new Date(item.acceptedAt))
							: "--:--";
					const endTime = item.completedAt
						? fmt(new Date(item.completedAt))
						: "--:--";

					return (
						<SimpleHistoryItem
							className={cn(
								index === dayAttendances.length - 1
									? ""
									: "border-b",
							)}
							title={title}
							subtitle={`${startTime} - ${endTime}`}
							href={`/history/${item.id}`}
							trailing={
								<View className="flex-row items-center justify-start max-w-2/3">
									<Avatar
										alt={`Avatar de ${studentName}`}
										className="mr-2"
									>
										<AvatarFallback>
											<Text className="text-xs font-bold">
												{studentInitials}
											</Text>
										</AvatarFallback>
									</Avatar>
									<Text className="font-medium text-sm text-foreground">
										{studentName.split(" ")[0]}
									</Text>
								</View>
							}
						/>
					);
				}}
				ListEmptyComponent={
					<View className="flex-1 items-center justify-center pt-20">
						<Text className="text-muted-foreground text-lg">
							Nenhum deslocamento neste dia.
						</Text>
					</View>
				}
				className="flex-1"
				contentContainerStyle={{ paddingTop: 24 }}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
}
