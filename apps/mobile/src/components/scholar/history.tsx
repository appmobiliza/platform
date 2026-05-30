import { useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import { FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";

const mockedShifts = [
	{ id: "1", date: "1 de agosto", count: 5 },
	{ id: "2", date: "3 de agosto", count: 2 },
	{ id: "3", date: "8 de agosto", count: 4 },
	{ id: "4", date: "10 de agosto", count: 0 },
];

export function ScholarHistory() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	return (
		<View className="flex-1 bg-background">
			<FlatList
				data={mockedShifts}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 24 }}
				ListHeaderComponent={
					<View
						className="px-6 pb-6"
						style={{ paddingTop: insets.top + 32 }}
					>
						<Text className="font-extrabold text-4xl text-foreground mb-2">
							Histórico
						</Text>
						<Text className="font-bold text-xl text-foreground">
							Turnos
						</Text>
					</View>
				}
				renderItem={({ item }) => (
					<Pressable
						onPress={() =>
							item.count > 0
								? router.push(`/history/shift/${item.id}`)
								: null
						}
						className="px-6 mb-4"
					>
						<View className="bg-card border border-border rounded-[24px] p-4 flex-row items-center">
							<View className="bg-primary w-12 h-12 rounded-xl items-center justify-center mr-4">
								<Clock color="#FFFFFF" size={24} />
							</View>
							<View>
								<Text className="font-bold text-lg text-foreground">
									{item.count > 0
										? `${item.count} deslocamentos`
										: "Nenhum deslocamento"}
								</Text>
								<Text className="text-muted-foreground text-sm">
									{item.date}
								</Text>
							</View>
						</View>
					</Pressable>
				)}
			/>
		</View>
	);
}
