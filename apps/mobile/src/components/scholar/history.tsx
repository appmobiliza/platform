import { useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import { FlatList, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

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
				renderItem={({ item, index }) => (
					<Pressable
						onPress={() =>
							item.count > 0
								? router.push(`/history/shift/${item.id}`)
								: null
						}
						className={cn(
							"border-b border-border p-6 flex-row items-center active:bg-primary/50",
							{
								"border-transparent":
									index === mockedShifts.length - 1,
							},
						)}
					>
						<View className="bg-primary w-12 h-12 rounded-sm items-center justify-center mr-4">
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
					</Pressable>
				)}
			/>
		</View>
	);
}
