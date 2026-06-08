import { ClockAlert, ClockFading } from "lucide-react-native";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FeaturedHistoryCard } from "@/components/featured-history-card";
import { ScholarHistory } from "@/components/scholar/history";
import { SimpleHistoryItem } from "@/components/simple-history-item";
import { StatusMessage } from "@/components/status-message";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { useLightStatusBar } from "@/hooks/use-light-status-bar";
import { UserRole, useUserRole } from "@/lib/auth-store";
import { formatDateTime } from "@/lib/date";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

function StudentHistory() {
	useLightStatusBar();

	const insets = useSafeAreaInsets();

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		trpc.requests.studentHistory.useInfiniteQuery(
			{ limit: 50 },
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		);

	const allItems = data?.pages.flatMap((page) => page.items) ?? [];
	const featured = allItems[0];
	const rest = allItems.slice(1);

	const renderItem = useCallback(
		({ item, index }: { item: (typeof rest)[number]; index: number }) => {
			const originName =
				item.originLocation?.name ?? item.originLocationId;
			const createdAt = new Date(item.createdAt);
			const subtitle = formatDateTime(createdAt);
			const isUnattended = item.status === "unattended";

			return (
				<SimpleHistoryItem
					className={cn({
						"border-b": index < rest.length - 1,
					})}
					title={originName}
					subtitle={subtitle}
					href={`/history/${item.id}`}
					trailing={
						isUnattended ? (
							<Badge variant="destructive">
								<Icon
									icon={ClockAlert}
									size={12}
									color="--destructive-foreground"
								/>
								<Text className="text-xs">Pendente</Text>
							</Badge>
						) : undefined
					}
				/>
			);
		},
		[rest.length],
	);

	if (isLoading) {
		return (
			<View className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<View className="flex-1">
			<FlatList
				className="flex-1"
				data={rest}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 16, paddingTop: 4 }}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.5}
				ListHeaderComponent={
					<View>
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
							<Text className="font-bold text-xl">
								Deslocamentos
							</Text>
						</View>

						{featured ? (
							<View className="px-6 pt-4">
								<FeaturedHistoryCard
									title={
										featured.originLocation?.name ??
										featured.originLocationId
									}
									date={formatDateTime(
										new Date(featured.createdAt),
									)}
									href={`/history/${featured.id}`}
									status={featured.status}
									originLatitude={
										featured.originLocation?.latitude
									}
									originLongitude={
										featured.originLocation?.longitude
									}
									destinationLatitude={
										featured.destinationLocation?.latitude
									}
									destinationLongitude={
										featured.destinationLocation?.longitude
									}
								/>
							</View>
						) : null}
					</View>
				}
				ListEmptyComponent={
					featured ? null : (
						<StatusMessage
							className="mt-48 max-w-2/3 mx-auto"
							icon={
								<Icon
									icon={ClockFading}
									size={48}
									color="--foreground"
								/>
							}
							title="Por enquanto está vazio..."
							description="Faça sua primeira solicitação para que ela apareça aqui!"
						/>
					)
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

export default function History() {
	const role = useUserRole();
	return role === UserRole.Scholar ? <ScholarHistory /> : <StudentHistory />;
}
