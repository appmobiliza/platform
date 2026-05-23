import { Image, View } from "react-native";

import { Text } from "@/components/ui/text";

export const NewsCarousel = () => {
	return (
		<View className="mt-4 mb-2">
			<Text className="font-bold text-lg mb-3">Notícias</Text>
			<View className="rounded-2xl overflow-hidden h-40 relative">
				<Image
					source={{ uri: "https://picsum.photos/seed/sapos/600/300" }}
					className="w-full h-full absolute"
					resizeMode="cover"
				/>
				<View className="absolute inset-0 bg-black/40" />
				<View className="absolute bottom-4 left-4 right-4">
					<Text className="text-white font-bold text-sm leading-5">
						28 de abril: Exposição itinerante sobre anfíbios chega à
						Biblioteca Central
					</Text>
				</View>
			</View>
			<View className="flex-row justify-center mt-3 gap-1.5">
				<View className="w-2 h-2 rounded-full bg-[#006971]" />
				<View className="w-2 h-2 rounded-full bg-gray-300" />
				<View className="w-2 h-2 rounded-full bg-gray-300" />
			</View>
		</View>
	);
};
