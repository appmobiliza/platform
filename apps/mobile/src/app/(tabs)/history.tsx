import { useRouter } from "expo-router";
import { Platform, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FeaturedHistoryCard } from "../../components/old/FeaturedHistoryCard";
import { SimpleHistoryItem } from "../../components/old/SimpleHistoryItem";

export default function History() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1 bg-brand-background">
			<View
				className="px-6 bg-brand-background"
				style={{
					paddingTop: Math.max(
						insets.top + 10,
						Platform.OS === "ios" ? 50 : 30,
					),
				}}
			>
				<Text className="text-gray-900 font-extrabold text-[36px] mt-2 mb-1">
					Histórico
				</Text>
				<Text className="text-gray-900 font-bold text-[20px] mb-4">
					Deslocamentos
				</Text>
			</View>

			<ScrollView
				className="flex-1 px-6"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 30, paddingTop: 4 }}
			>
				<FeaturedHistoryCard
					title="ICBS - Pista da UFAL"
					date="6 de agosto • 19h"
					onPress={() => router.push("/history/1")}
				/>

				<View className="mt-2">
					<SimpleHistoryItem
						title="CAC - Centro de Artes e Cultura"
						subtitle="1 de agosto, 18h00"
						onPress={() => router.push("/history/2")}
					/>
					<SimpleHistoryItem
						title="Biblioteca Central"
						subtitle="3 de agosto, 14h20"
						onPress={() => router.push("/history/3")}
					/>
					<SimpleHistoryItem
						title="Instituto de Química e Biotec..."
						subtitle="8 de agosto, 9h00"
						onPress={() => router.push("/history/4")}
					/>
					<SimpleHistoryItem
						title="Reitoria da UFAL"
						subtitle="10 de agosto, 19h00"
						onPress={() => router.push("/history/5")}
					/>
				</View>
			</ScrollView>
		</View>
	);
}
