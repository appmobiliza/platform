import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewsCarousel } from "@/components/news-carousel";
import { PlaceCard } from "@/components/place-card";
import { ScholarHome } from "@/components/scholar/home";
import { SearchBar } from "@/components/search-bar";
import { Text } from "@/components/ui/text";

import { useUserRole } from "@/lib/auth-store";
import { setNearestPoint } from "@/lib/location-store";

import { Logo } from "@/assets/logo";
import { ufalPoints } from "@/constants/locations";

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

function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371e3;
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lon2 - lon1) * Math.PI) / 180;
	const x =
		Math.sin(Δφ / 2) ** 2 +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(x));
}

function StudentHome() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	useFocusEffect(
		useCallback(() => {
			const setupLocation = async () => {
				const { status } =
					await Location.getForegroundPermissionsAsync();

				if (status !== "granted") {
					router.replace("/location-permission");
					return;
				}

				// Permissão concedida — calcula o ponto UFAL mais próximo
				try {
					const position = await Location.getCurrentPositionAsync({
						accuracy: Location.Accuracy.Balanced,
					});

					const userLat = position.coords.latitude;
					const userLng = position.coords.longitude;

					if (ufalPoints.length === 0) return;

					let closestPoint = ufalPoints[0];
					if (!closestPoint) return;

					let minDistance = calculateDistance(
						userLat,
						userLng,
						closestPoint.latitude,
						closestPoint.longitude,
					);

					for (let i = 1; i < ufalPoints.length; i++) {
						const point = ufalPoints[i];
						if (!point) continue;
						const dist = calculateDistance(
							userLat,
							userLng,
							point.latitude,
							point.longitude,
						);
						if (dist < minDistance) {
							minDistance = dist;
							closestPoint = point;
						}
					}

					setNearestPoint({
						name: closestPoint.name,
						abbreviation: closestPoint.abbrev,
						latitude: closestPoint.latitude,
						longitude: closestPoint.longitude,
					});
				} catch (error) {
					console.warn("Failed to get current location:", error);
				}
			};

			setupLocation();
		}, [router]),
	);

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
						onPress={() => router.push("/request")}
					/>
				</View>

				{/* Locais Recentes */}
				<View className="px-4">
					<PlaceCard
						title="Restaurante Universitário"
						description="Hoje, 12h35"
						icon={{ name: "star" }}
						className="mb-3"
					/>
					<View className="flex-row gap-3">
						<PlaceCard
							className="flex-1"
							title="CECA"
							description="Ontem, 16h12"
							icon={{ name: "clock" }}
						/>
						<PlaceCard
							className="flex-1"
							title="IQB"
							description="Há 2 dias, 16h24"
							icon={{ name: "clock" }}
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
					<View className="flex-col gap-3">
						<PlaceCard
							title="Restaurante Universitário"
							description="Último deslocamento há 2 dias"
							icon={{ name: "map" }}
						/>
						<PlaceCard
							title="Reitoria"
							description="Último deslocamento há 6 dias"
							icon={{ name: "map" }}
						/>
						<PlaceCard
							title="Biblioteca Central"
							description="Último deslocamento há 10 dias"
							icon={{ name: "map" }}
						/>
						<PlaceCard
							title="Instituto de Computação"
							description="Último deslocamento há 12 dias"
							icon={{ name: "map" }}
						/>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}

export default function Home() {
	const role = useUserRole();
	return role === "scholar" ? <ScholarHome /> : <StudentHome />;
}
