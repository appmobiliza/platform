import { FlatList, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FeaturedHistoryCard } from "@/components/featured-history-card";
import { ScholarHistory } from "@/components/scholar/history";
import { SimpleHistoryItem } from "@/components/simple-history-item";
import { StatusMessage } from "@/components/status-message";
import { Text } from "@/components/ui/text";

import { UserRole, useUserRole } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const historyItems = [
	{
		id: "2",
		title: "CAC - Centro de Artes e Cultura",
		subtitle: "1 de agosto, 18h00",
		href: "/history/2",
	},
	{
		id: "3",
		title: "Biblioteca Central",
		subtitle: "3 de agosto, 14h20",
		href: "/history/3",
	},
	{
		id: "4",
		title: "Instituto de Química e Biotec...",
		subtitle: "8 de agosto, 9h00",
		href: "/history/4",
	},
	{
		id: "5",
		title: "Reitoria da UFAL",
		subtitle: "10 de agosto, 19h00",
		href: "/history/5",
	},
];

function StudentHistory() {
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1">
			<FlatList
				className="flex-1"
				data={historyItems}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 16, paddingTop: 4 }}
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

						<View className="px-6 pt-4">
							<FeaturedHistoryCard
								title="ICBS - Pista da UFAL"
								date="6 de agosto • 19h"
								href={`/history/1`}
							/>
						</View>
					</View>
				}
				ListEmptyComponent={
					<StatusMessage
						title={"Por enquanto está vazio..."}
						description="Faça sua primeira solicitação para que ela apareça aqui!"
					/>
				}
				renderItem={({ item, index }) => (
					<SimpleHistoryItem
						className={cn({
							"border-b": index < historyItems.length - 1,
						})}
						title={item.title}
						subtitle={item.subtitle}
						href={item.href}
					/>
				)}
			/>
		</View>
	);
}

export default function History() {
	const role = useUserRole();
	return role === UserRole.Scholar ? <ScholarHistory /> : <StudentHistory />;
}
