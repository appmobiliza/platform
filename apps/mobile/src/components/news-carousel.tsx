import { Image } from "expo-image";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

export const NewsCarousel = () => {
	return (
		<View>
			<Text className="font-bold text-lg mb-3">Notícias</Text>
			<View className="rounded-2xl overflow-hidden h-40 relative">
				<Image
					source={{
						uri: "https://picsum.photos/seed/sapos2/600/300",
					}}
					style={{
						position: "absolute",
						top: 0,
						right: 0,
						bottom: 0,
						left: 0,
					}}
					contentFit="cover"
					contentPosition="center"
				/>
				<View
					className="absolute inset-0"
					style={{
						experimental_backgroundImage:
							"radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.12) 62%, rgba(0,0,0,0.5) 100%)",
					}}
				/>
				<View className="absolute bottom-4 left-4 right-4">
					<Text className="text-white font-bold text-sm leading-5">
						28 de abril: Exposição itinerante sobre anfíbios chega à
						Biblioteca Central
					</Text>
				</View>
			</View>
			<View className="flex-row justify-center mt-3 gap-1.5">
				<View className="w-2 h-2 rounded-full bg-primary" />
				<View className="w-2 h-2 rounded-full bg-border" />
				<View className="w-2 h-2 rounded-full bg-border" />
			</View>
		</View>
	);
};
