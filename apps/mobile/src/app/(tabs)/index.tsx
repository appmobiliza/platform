import { ScrollView, Text, View } from "react-native";

import { Logo } from "@/assets/logo";

import { NewsCarousel } from "../../components/old/NewsCarousel";
import { PlaceCard } from "../../components/old/PlaceCard";
import { SearchBar } from "../../components/old/SearchBar";

export default function Home() {
	return (
		<View className="flex-1">
			{/* Header Escuro */}
			<View className="bg-primary pt-14 pb-20 px-6 items-center">
				<Logo />
			</View>

			{/* Main Content - Scrollable */}
			<View className="flex-1 -mt-10">
				<View className="flex-1 rounded-t-[32px] overflow-hidden">
					<ScrollView
						className="flex-1 px-6 pt-10"
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 100 }}
					>
						{/* Título Centralizado */}
						<Text className="text-gray-900 font-bold text-[32px] mb-6 text-center">
							Para onde vamos?
						</Text>

						<View className="mb-6">
							<SearchBar placeholder="Biblioteca Central" />
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
									title="CECA"
									subtitle="Ontem, 16h12"
									iconType="clock"
									layout="half"
								/>
								<PlaceCard
									title="IQB"
									subtitle="Há 2 dias, 16h24"
									iconType="clock"
									layout="half"
								/>
							</View>
						</View>

						{/* Notícias */}
						<NewsCarousel />

						{/* Rotas Frequentes */}
						<View className="mt-4 mb-8">
							<Text className="text-gray-900 font-bold text-[18px] mb-3">
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
			</View>
		</View>
	);
}
