import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { Clock, MapPin } from "lucide-react-native";
import { useCallback, useRef } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NewsCarousel } from "@/components/news-carousel";
import { PlaceCard } from "@/components/place-card";
import { ScholarHome } from "@/components/scholar/home";
import { SearchBar } from "@/components/search-bar";
import { Text } from "@/components/ui/text";

import { useUserRole } from "@/lib/auth-store";
import { haversineMeters } from "@/lib/distance";
import { setNearestPoint } from "@/lib/location-store";
import { getRequestState } from "@/lib/request-store";
import { trpc } from "@/lib/trpc/client";

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

const getPosition = async () => {
	// 1. Last known position — instant, no device settings dependency
	const last = await Location.getLastKnownPositionAsync({
		maxAge: 5 * 60 * 1000, // accept up to 5 min old
		requiredAccuracy: 5000, // meters, loose enough for campus-level use
	});
	console.log(
		`Last known position: ${last?.coords.latitude}, ${last?.coords.longitude}`,
	);
	if (last) return last;

	// 2. Live fix — try descending accuracy until one works
	for (const accuracy of [
		Location.Accuracy.Balanced,
		Location.Accuracy.Low,
		Location.Accuracy.Lowest,
	]) {
		try {
			console.log(`Trying accuracy: ${accuracy}`);
			return await Location.getCurrentPositionAsync({ accuracy });
		} catch {
			// try next tier
		}
	}

	throw new Error("Unable to determine location");
};

function StudentHome() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	// Fetch campus locations from the DB (source of truth)
	const { data: campusLocations = [] } = trpc.locations.list.useQuery();
	const campusLocationsRef = useRef(campusLocations);
	campusLocationsRef.current = campusLocations;

	useFocusEffect(
		useCallback(() => {
			// ─── Restore ongoing trip if one was in progress ────────────────
			const persisted = getRequestState();
			const hasOngoingRequest =
				persisted.activeRequestId &&
				(persisted.searchState !== "idle" ||
					persisted.stage === "trip");
			if (hasOngoingRequest) {
				router.replace("/request");
				return;
			}

			const setupLocation = async () => {
				const { status } =
					await Location.getForegroundPermissionsAsync();

				if (status !== "granted") {
					router.replace("/location-permission");
					return;
				}

				// Permissão concedida — calcula o ponto UFAL mais próximo
				try {
					const position = await getPosition();

					const userLat = position.coords.latitude;
					const userLng = position.coords.longitude;

					console.log("User position:", userLat, userLng);

					const locations = campusLocationsRef.current; // ← always fresh
					if (locations.length === 0) return;

					let closestPoint = locations[0];
					if (!closestPoint) {
						console.warn("No campus locations available");
						return;
					}

					let minDistance = haversineMeters(
						userLat,
						userLng,
						closestPoint.latitude,
						closestPoint.longitude,
					);

					for (let i = 1; i < locations.length; i++) {
						const point = locations[i];
						if (!point) continue;
						const dist = haversineMeters(
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

					console.log(
						"Closest point:",
						closestPoint,
						"Distance:",
						minDistance,
					);

					setNearestPoint({
						name: closestPoint.name,
						abbreviation: closestPoint.abbreviation ?? undefined,
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
						className="mb-3"
						icon={{ as: Clock }}
					/>
					<View className="flex-row gap-3">
						<PlaceCard
							className="flex-1"
							title="CECA"
							description="Ontem, 16h12"
							icon={{ as: Clock }}
						/>
						<PlaceCard
							className="flex-1"
							title="IQB"
							description="Há 2 dias, 16h24"
							icon={{ as: Clock }}
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
							icon={{ as: MapPin }}
						/>
						<PlaceCard
							title="Reitoria"
							description="Último deslocamento há 6 dias"
							icon={{ as: MapPin }}
						/>
						<PlaceCard
							title="Biblioteca Central"
							description="Último deslocamento há 10 dias"
							icon={{ as: MapPin }}
						/>
						<PlaceCard
							title="Instituto de Computação"
							description="Último deslocamento há 12 dias"
							icon={{ as: MapPin }}
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
