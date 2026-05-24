import { useRouter } from "expo-router";
import { ArrowLeft, Navigation, X } from "lucide-react-native";
import {
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// import MapView, { Marker } from "../../../components/ui/Map";

export default function AddressMap() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1 bg-brand-background">
			{/* Green Header */}
			<View
				className="px-4 pb-4 bg-[#00635D] flex-row items-center gap-3 z-10"
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
					className="p-2"
				>
					<ArrowLeft size={24} color="white" />
				</TouchableOpacity>

				<View className="flex-1 flex-row items-center bg-white rounded-xl px-3 py-2">
					<TextInput
						className="flex-1 text-gray-900 text-base"
						defaultValue="Instituto de Física"
					/>
					<TouchableOpacity className="p-1">
						<X size={18} color="#9CA3AF" />
					</TouchableOpacity>
				</View>
			</View>

			<View className="flex-1 relative">
				{/* <MapView
					style={{ flex: 1 }}
					initialRegion={{
						latitude: -9.5539,
						longitude: -35.7722,
						latitudeDelta: 0.005,
						longitudeDelta: 0.005,
					}}
				>
					<Marker
						coordinate={{ latitude: -9.5539, longitude: -35.7722 }}
					/>
				</MapView> */}

				{/* Current Location FAB */}
				<TouchableOpacity
					activeOpacity={0.8}
					className="absolute bottom-6 right-6 bg-gray-900 w-14 h-14 rounded-full items-center justify-center shadow-md"
				>
					<Navigation size={24} color="white" />
				</TouchableOpacity>
			</View>

			{/* Bottom Action */}
			<View
				className="px-6 pt-4 bg-white border-t border-gray-100"
				style={{ paddingBottom: Math.max(insets.bottom, 24) }}
			>
				<TouchableOpacity
					activeOpacity={0.8}
					className="bg-[#00635D] w-full py-4 rounded-full items-center justify-center shadow-sm"
					onPress={() => router.push("/saved/edit")}
				>
					<Text className="text-white font-bold text-base">
						Pronto
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
