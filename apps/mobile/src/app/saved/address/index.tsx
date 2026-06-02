import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, X } from "lucide-react-native";
import {
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddressSearch() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const results = [
		{
			id: 1,
			name: "CEPETEC",
			subtitle: "Instituto de Computação, UFAL",
			distance: "6.2km",
		},
		{
			id: 2,
			name: "CEPETEC",
			subtitle: "Instituto de Computação, UFAL",
			distance: "6.2km",
		},
		{
			id: 3,
			name: "CEPETEC",
			subtitle: "Instituto de Computação, UFAL",
			distance: "6.2km",
		},
		{
			id: 4,
			name: "CEPETEC",
			subtitle: "Instituto de Computação, UFAL",
			distance: "6.2km",
		},
	];

	return (
		<View className="flex-1 bg-brand-background">
			{/* Green Header */}
			<View
				className="px-4 pb-4 bg-[#00635D] flex-row items-center gap-3"
				style={{
					paddingTop: Math.max(
						insets.top + 10,
						Platform.OS === "ios" ? 50 : 30,
					),
				}}
			>
				<Pressable
					onPress={() => router.back()}
					style={({ pressed }) => pressed && { opacity: 0.7 }}
					className="p-2"
				>
					<ArrowLeft size={24} color="white" />
				</Pressable>

				<View className="flex-1 flex-row items-center rounded-xl px-3 py-2">
					<TextInput
						className="flex-1 text-gray-900 text-base"
						defaultValue="Banquinho de Meteorol"
						autoFocus
					/>
					<Pressable className="p-1">
						<X size={18} color="#9CA3AF" />
					</Pressable>
				</View>
			</View>

			<ScrollView className="flex-1">
				{results.map((item) => (
					<Pressable
						key={item.id}
						style={({ pressed }) => pressed && { opacity: 0.7 }}
						className="flex-row items-center px-6 py-4 border-b border-gray-100"
					>
						<View className="items-center justify-center mr-4 w-10">
							<MapPin size={22} color="#4B5563" />
							<Text className="text-gray-500 text-xs mt-1">
								{item.distance}
							</Text>
						</View>
						<View className="flex-1">
							<Text className="text-gray-900 font-semibold text-base">
								{item.name}
							</Text>
							<Text className="text-gray-500 text-sm mt-0.5">
								{item.subtitle}
							</Text>
						</View>
					</Pressable>
				))}

				<Pressable
					style={({ pressed }) => pressed && { opacity: 0.7 }}
					onPress={() => router.push("/saved/address/map")}
					className="flex-row items-center px-6 py-5 border-b border-gray-100"
				>
					<View className="items-center justify-center mr-4 w-10">
						<View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
							<MapPin size={16} color="#4B5563" />
						</View>
					</View>
					<Text className="text-gray-900 font-semibold text-base">
						Defina a localização no mapa
					</Text>
				</Pressable>
			</ScrollView>
		</View>
	);
}
