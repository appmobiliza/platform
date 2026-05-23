import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewsCarousel } from "@/components/news-carousel";
import { PlaceCard } from "@/components/place-card";
import { SearchBar } from "@/components/search-bar";
import { Text } from "@/components/ui/text";

import { Logo } from "@/assets/logo";

export default function Home() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	return (
		<View className="flex-1">
			{/* Header Escuro */}
			<View
				className="bg-primary pb-16 px-4 flex justify-center items-center"
				style={{
					paddingTop: insets.top + 64,
				}}
			>
				<Logo height={30} width={188} />
			</View>

			{/* Main Content - Scrollable */}
			<ScrollView
				className="flex-1 px-4 py-10"
				showsVerticalScrollIndicator={false}
			>
				<View className="mb-6 flex flex-col items-center justify-center gap-6">
					<Text className="font-bold text-3xl text-center">
						Para onde vamos?
					</Text>
					<SearchBar
						examples={[
							"Restaurante Universitário",
							"CECA",
							"IQB",
							"Reitoria",
							"Biblioteca Central",
							"Instituto de Computação",
							"Faculdade de Letras",
							"Instituto de Ciências Biológicas",
						]}
						onPress={() => router.push("/saved/address")}
					/>
				</View>

				{/* Locais Recentes */}
				<View className="mb-2">
					<PlaceCard
						title="Restaurante Universitário"
						subtitle="Hoje, 12h35"
						iconType="star"
						className="mb-3"
					/>
					<View className="flex-row gap-3">
						<PlaceCard
							className="flex-1"
							title="CECA"
							subtitle="Ontem, 16h12"
							iconType="clock"
						/>
						<PlaceCard
							className="flex-1"
							title="IQB"
							subtitle="Há 2 dias, 16h24"
							iconType="clock"
						/>
					</View>
				</View>

				{/* Notícias */}
				<NewsCarousel />

				{/* Rotas Frequentes */}
				<View className="mt-4 mb-8">
					<Text className="font-bold text-lg mb-3">
						Rotas Frequentes
					</Text>
					<PlaceCard
						title="Restaurante Universitário"
						subtitle="Último deslocamento há 2 dias"
						iconType="map"
						className="mb-3"
					/>
				</View>
			</ScrollView>
		</View>
	);
}
