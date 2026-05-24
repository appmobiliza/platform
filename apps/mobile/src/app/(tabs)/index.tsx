import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewsCarousel } from "@/components/news-carousel";
import { PlaceCard } from "@/components/place-card";
import { SearchBar } from "@/components/search-bar";
import { Text } from "@/components/ui/text";

import { Logo } from "@/assets/logo";

const newsItems = [
	{
		image: "https://picsum.photos/seed/sapos2/600/300",
		label: "28 de abril: Exposição itinerante sobre anfíbios chega à Biblioteca Central",
		link: "https://example.com/noticias/anfibios",
	},
	{
		image: "https://picsum.photos/seed/mobilidade1/600/300",
		label: "Nova rota experimental liga o campus ao terminal em horários de pico",
		link: "https://example.com/noticias/rota-experimental",
	},
	{
		image: "https://picsum.photos/seed/ciencia2/600/300",
		label: "Semana de ciência e tecnologia abre inscrições para oficinas gratuitas",
		link: "https://example.com/noticias/semana-ciencia",
	},
];

export default function Home() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	return (
		<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
			<View
				className="bg-primary pb-16 px-4 flex justify-center items-center mb-8"
				style={{
					paddingTop: insets.top + 64,
				}}
			>
				<Logo height={30} width={188} />
			</View>

			<View className="gap-6 mb-4">
				<View className="flex flex-col items-center justify-center gap-6 px-4">
					<Text className="font-bold text-3xl text-center">
						Para onde vamos?
					</Text>
					<SearchBar
						placeholder="Buscar por localizações"
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
				<View className="px-4">
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

				<View>
					<Text className="font-bold text-lg mb-3 pl-4">
						Notícias
					</Text>
					<NewsCarousel items={newsItems} autoScroll />
				</View>

				{/* Rotas Frequentes */}
				<View className="px-4">
					<Text className="font-bold text-lg mb-3">
						Rotas Frequentes
					</Text>
					<View className="flex-col gap-2">
						<PlaceCard
							title="Restaurante Universitário"
							subtitle="Último deslocamento há 2 dias"
							iconType="map"
						/>
						<PlaceCard
							title="Reitoria"
							subtitle="Último deslocamento há 6 dias"
							iconType="map"
						/>
						<PlaceCard
							title="Biblioteca Central"
							subtitle="Último deslocamento há 10 dias"
							iconType="map"
						/>
						<PlaceCard
							title="Instituto de Computação"
							subtitle="Último deslocamento há 12 dias"
							iconType="map"
						/>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}
