import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	ArrowLeft,
	MapPin,
	RotateCcw,
	Star,
	User as UserIcon,
} from "lucide-react-native";
import {
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MapView from "../../components/old/Map";

export default function HistoryDetails() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1 bg-brand-background">
			{/* Header */}
			<View
				className="px-6 pb-4 bg-brand-background flex-row items-center gap-4"
				style={{
					paddingTop: Math.max(
						insets.top + 10,
						Platform.OS === "ios" ? 50 : 30,
					),
				}}
			>
				<TouchableOpacity
					onPress={() => router.back()}
					activeOpacity={0.7}
					className="p-2 -ml-2"
				>
					<ArrowLeft size={24} color="#111827" />
				</TouchableOpacity>
				<Text className="text-gray-900 font-bold text-2xl">
					Informações
				</Text>
			</View>

			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Map Header inside Card */}
				<View className="px-6 pt-2 pb-6">
					<View className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm mb-6">
						<View className="h-48 w-full bg-gray-200">
							<MapView
								style={{ flex: 1 }}
								initialRegion={{
									latitude: -9.5539,
									longitude: -35.7722,
									latitudeDelta: 0.005,
									longitudeDelta: 0.005,
								}}
								scrollEnabled={false}
								zoomEnabled={false}
								pitchEnabled={false}
								rotateEnabled={false}
							/>
						</View>
						<View className="p-5">
							<Text className="text-gray-900 font-bold text-xl mb-1">
								CAC - Pista da UFAL
							</Text>
							<Text className="text-gray-500 text-sm">
								6 de agosto • 19h
							</Text>

							{/* Bolsista Profile */}
							<View className="flex-row items-center mt-4 pt-4 border-t border-gray-100 gap-3">
								<View className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden items-center justify-center">
									<UserIcon size={20} color="#9CA3AF" />
								</View>
								<View className="flex-1">
									<Text className="text-gray-900 font-medium text-sm">
										Atendido por João Carlos
									</Text>
								</View>
								<View className="bg-sky-50 px-3 py-1 rounded-full flex-row items-center gap-1">
									<Text className="text-sky-600 font-medium text-xs">
										Manhã
									</Text>
								</View>
							</View>
						</View>
					</View>

					{/* Timeline */}
					<View className="px-2 mb-8">
						<View className="flex-row items-start mb-6 relative">
							<View className="items-center mr-4">
								<View className="bg-brand-primary/10 w-10 h-10 rounded-full items-center justify-center">
									<MapPin size={18} color="#00635D" />
								</View>
								{/* Vertical Line */}
								<View className="w-0.5 h-10 bg-gray-200 absolute top-10" />
							</View>
							<View className="flex-1 justify-center h-10">
								<Text className="text-gray-900 font-bold text-base">
									CAC - Centro de Artes e Cultura
								</Text>
							</View>
							<View className="justify-center h-10">
								<Text className="text-gray-400 text-xs">
									8:04 PM
								</Text>
							</View>
						</View>

						<View className="flex-row items-start">
							<View className="items-center mr-4">
								<View className="bg-[#00635D] w-10 h-10 rounded-full items-center justify-center">
									<MapPin size={18} color="white" />
								</View>
							</View>
							<View className="flex-1 justify-center h-10">
								<Text className="text-gray-900 font-bold text-base">
									Pista da UFAL
								</Text>
							</View>
							<View className="justify-center h-10">
								<Text className="text-gray-400 text-xs">
									8:33 PM
								</Text>
							</View>
						</View>
					</View>

					{/* Action Buttons */}
					<View className="gap-3">
						<TouchableOpacity
							activeOpacity={0.8}
							className="bg-[#00635D] w-full py-4 rounded-full flex-row items-center justify-center gap-2 shadow-sm"
						>
							<Star size={18} color="white" />
							<Text className="text-white font-bold text-base">
								Avaliar
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							activeOpacity={0.8}
							className="bg-brand-primary w-full py-4 rounded-full flex-row items-center justify-center gap-2 shadow-sm"
							style={{ backgroundColor: "#0f766e" }}
						>
							<RotateCcw size={18} color="white" />
							<Text className="text-white font-bold text-base">
								Reagendar
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
