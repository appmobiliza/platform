import { useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import { useCallback, useMemo } from "react";
import {
	ActivityIndicator,
	FlatList,
	Platform,
	Pressable,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatusMessage } from "@/components/status-message";
import { Text } from "@/components/ui/text";

import { formatDateLong, getDateKey } from "@/lib/date";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

type ShiftGroup = {
	dateKey: string;
	dateLabel: string;
	count: number;
	firstAcceptedAt: string;
};

function groupAttendancesByDay(
	items: { id: string; acceptedAt: string }[],
): ShiftGroup[] {
	const groups = new Map<string, { id: string; acceptedAt: string }[]>();

	for (const item of items) {
		const key = getDateKey(new Date(item.acceptedAt));
		const existing = groups.get(key) ?? [];
		existing.push(item);
		groups.set(key, existing);
	}

	return Array.from(groups.entries())
		.map(([dateKey, items]) => ({
			dateKey,
			dateLabel: formatDateLong(new Date(items[0]!.acceptedAt)),
			count: items.length,
			firstAcceptedAt: items[0]!.acceptedAt,
		}))
		.sort(
			(a, b) =>
				new Date(b.firstAcceptedAt).getTime() -
				new Date(a.firstAcceptedAt).getTime(),
		);
}

export function ScholarHistory() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		trpc.requests.scholarHistory.useInfiniteQuery(
			{ limit: 50 },
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const allItems = useMemo(
		() => data?.pages.flatMap((page) => page.items) ?? [],
		[data],
	);

	const shifts = useMemo(() => groupAttendancesByDay(allItems), [allItems]);

	const renderItem = useCallback(
		({ item, index }: { item: ShiftGroup; index: number }) => (
			<Pressable
				onPress={() =>
					item.count > 0
						? router.push(`/history/shift/${item.dateKey}`)
						: null
				}
				className={cn(
					"border-b border-border p-6 flex-row items-center active:bg-primary/50",
					{
						"border-transparent": index === shifts.length - 1,
					},
				)}
			>
				<View className="bg-primary w-12 h-12 rounded-sm items-center justify-center mr-4">
					<Clock color="#FFFFFF" size={24} />
				</View>
				<View>
					<Text className="font-bold text-lg text-foreground">
						{item.count > 0
							? `${item.count} deslocamento${item.count !== 1 ? "s" : ""}`
							: "Nenhum deslocamento"}
					</Text>
					<Text className="text-muted-foreground text-sm">
						{item.dateLabel}
					</Text>
				</View>
			</Pressable>
		),
		[router, shifts.length],
	);

	if (isLoading) {
		return (
			<View className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<FlatList
				data={shifts}
				keyExtractor={(item) => item.dateKey}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 24 }}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.5}
				ListHeaderComponent={
					<View
						className="px-6 gap-4"
						style={{
							paddingTop: Math.max(
								insets.top + 16,
								Platform.OS === "ios" ? 50 : 30,
							),
						}}
					>
						<Text className="font-extrabold text-4xl">
							Histórico
						</Text>
						<Text className="font-bold text-xl mb-4">Turnos</Text>
					</View>
				}
				ListEmptyComponent={
					<StatusMessage
						title="Por enquanto está vazio..."
						description="Os deslocamentos que você atendeu aparecerão aqui!"
					/>
				}
				ListFooterComponent={
					isFetchingNextPage ? (
						<View className="py-4">
							<ActivityIndicator size="small" />
						</View>
					) : null
				}
				renderItem={renderItem}
			/>
		</View>
	);
}
