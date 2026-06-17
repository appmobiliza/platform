import * as Location from "expo-location";
import { useNetworkState } from "expo-network";
import { useFocusEffect, useRouter } from "expo-router";
import { Clock, MapPin } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Logo } from "@/assets/logo";

import { NewsCarousel, type NewsItem } from "@/components/news-carousel";
import { NoConnection } from "@/components/no-connection";
import { PlaceCard } from "@/components/place-card";
import type { Place } from "@/components/request-flow-sheet/types";
import { ScholarHome } from "@/components/scholar/home";
import { SearchBar } from "@/components/search-bar";
import SimplifiedHome from "@/components/simplified-interface/home";
import { Text } from "@/components/ui/text";

import { useSimplifiedInterface, useUser, useUserRole } from "@/lib/auth/store";
import { formatRelativeDate } from "@/lib/date";
import { haversineMeters } from "@/lib/geo/distance";
import { trpc } from "@/lib/trpc/client";

import {
	getCachedCampusLocations,
	setCachedCampusLocations,
	setNearestPoint,
	useNearestPoint,
} from "@/stores/location-store";
import { getCachedNews, setCachedNews } from "@/stores/news-store";
import { getRequestState } from "@/stores/request-store";
import {
	resolveRouteEntry,
	useRouteHistory,
} from "@/stores/route-history-store";

// ─── Relative date helpers (Portuguese locale) ───────────────────────────────

function formatLastTripLabel(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Último deslocamento hoje";
	if (diffDays === 1) return "Último deslocamento ontem";
	return `Último deslocamento há ${diffDays} dias`;
}

const getPosition = async () => {
	// 1. Last known position — instant, no device settings dependency
	const last = await Location.getLastKnownPositionAsync({
		maxAge: 5 * 60 * 1000, // accept up to 5 min old
		requiredAccuracy: 5000, // meters, loose enough for campus-level use
	});
	// console.log(
	// 	`Last known position: ${last?.coords.latitude}, ${last?.coords.longitude}`,
	// );
	if (last) return last;

	// 2. Live fix — try descending accuracy until one works
	for (const accuracy of [
		Location.Accuracy.Balanced,
		Location.Accuracy.Low,
		Location.Accuracy.Lowest,
	]) {
		try {
			// console.log(`Trying accuracy: ${accuracy}`);
			return await Location.getCurrentPositionAsync({ accuracy });
		} catch {
			// try next tier
		}
	}

	throw new Error("Unable to determine location");
};

type StudentHomeProps = {
	insets: {
		top: number;
		bottom: number;
		left: number;
		right: number;
	};
};

function StudentHome({ insets }: StudentHomeProps) {
	const router = useRouter();

	const networkState = useNetworkState();
	const hasConnection = networkState.isConnected;

	// ─── News (cache-first, background refresh) ────────────────────────────
	// Show cached news immediately to avoid layout shift. Fresh data is
	// fetched in background and persisted to cache, but never updates the
	// displayed state reactively — changes appear only on the next app open.

	const [newsItems] = useState<NewsItem[]>(() => getCachedNews());

	const { data: freshNews } = trpc.news.list.useQuery(
		{ limit: 5 },
		{
			staleTime: 30 * 60 * 1000,
			gcTime: 60 * 60 * 1000,
		},
	);

	useEffect(() => {
		if (!freshNews) return;
		const mapped: NewsItem[] = freshNews.map((n) => ({
			image: n.imageUrl ?? "",
			label: n.title,
			link: n.url,
		}));
		setCachedNews(mapped);
	}, [freshNews]);

	const navigateWithDestination = useCallback(
		(destinationId: string) => {
			router.push({
				pathname: "/request",
				params: { destinationId },
			});
		},
		[router],
	);

	// ─── Read from local store ───────────────────────────────────────────

	const { recent, frequent } = useRouteHistory();

	const recentDestinations = useMemo(
		() => recent.map((entry) => resolveRouteEntry(entry)),
		[recent],
	);

	const frequentDestinations = useMemo(
		() =>
			frequent.map((entry) => {
				const resolved = resolveRouteEntry(entry);
				return {
					id: resolved.id,
					name: resolved.name,
					lastDate: resolved.date,
				};
			}),
		[frequent],
	);

	const hasRecentPlaces = recentDestinations.length > 0;
	const hasFrequentRoutes = frequentDestinations.length > 0;

	// Pick the first card (full width) and the rest (side by side)
	const recentPrimary = recentDestinations[0];
	const recentSecondary = recentDestinations.slice(1, 3);

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
						hasConnection={hasConnection}
						onPress={() => router.push("/request")}
					/>
				</View>

				{!hasConnection && (
					<View className="px-4">
						<NoConnection />
					</View>
				)}

				{/* Locais Recentes */}
				{hasRecentPlaces && (
					<View className="px-4">
						{recentPrimary && (
							<PlaceCard
								title={recentPrimary.name}
								description={formatRelativeDate(
									recentPrimary.date,
								)}
								className="mb-3"
								icon={{ as: Clock }}
								onPress={() =>
									navigateWithDestination(recentPrimary.id)
								}
								disabled={!hasConnection}
							/>
						)}
						{recentSecondary.length > 0 && (
							<View className="flex-row gap-3">
								{recentSecondary.map((dest) => (
									<PlaceCard
										key={dest.name}
										className="flex-1"
										title={dest.abbreviation ?? dest.name}
										description={formatRelativeDate(
											dest.date,
										)}
										icon={{ as: Clock }}
										onPress={() =>
											navigateWithDestination(dest.id)
										}
										disabled={!hasConnection}
									/>
								))}
							</View>
						)}
					</View>
				)}

				{/* Notícias */}
				<View>
					<Text className="font-bold text-lg mb-3 pl-4">
						Notícias
					</Text>
					<NewsCarousel items={newsItems} autoScroll />
				</View>

				{/* Rotas Frequentes */}
				{hasFrequentRoutes && (
					<View className="px-4">
						<Text className="font-bold text-lg mb-3">
							Rotas Frequentes
						</Text>
						<View className="flex-col gap-3">
							{frequentDestinations.map((dest) => (
								<PlaceCard
									key={dest.name}
									title={dest.name}
									description={formatLastTripLabel(
										dest.lastDate,
									)}
									icon={{ as: MapPin }}
									onPress={() =>
										navigateWithDestination(dest.id)
									}
									disabled={!hasConnection}
								/>
							))}
						</View>
					</View>
				)}
			</View>
		</ScrollView>
	);
}

export default function Home() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const role = useUserRole();
	const user = useUser();
	const nearestPoint = useNearestPoint();
	const [isLocationLoading, setIsLocationLoading] = useState(true);

	const userName = user.name?.split(" ")[0] ?? "";
	const simplifiedInterface = useSimplifiedInterface();

	const { data: campusLocations = [] } = trpc.locations.list.useQuery(
		undefined,
		{
			staleTime: 30 * 60 * 1000,
			gcTime: 60 * 60 * 1000,
		},
	);
	const campusLocationsRef = useRef(campusLocations);
	campusLocationsRef.current = campusLocations;

	useEffect(() => {
		if (campusLocations.length > 0) {
			setCachedCampusLocations(campusLocations as Place[]);
		}
	}, [campusLocations]);

	useFocusEffect(
		useCallback(() => {
			const persisted = getRequestState();
			const hasOngoingRequest =
				persisted.activeRequestId && persisted.stage === "trip";

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

				try {
					const position = await getPosition();

					const userLat = position.coords.latitude;
					const userLng = position.coords.longitude;

					const locations =
						campusLocationsRef.current.length > 0
							? campusLocationsRef.current
							: getCachedCampusLocations();
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

			setIsLocationLoading(true);
			setupLocation().finally(() => setIsLocationLoading(false));
		}, [router]),
	);

	if (role === "student" && simplifiedInterface) {
		return (
			<SimplifiedHome
				nearestPoint={nearestPoint}
				userName={userName}
				isLocationLoading={isLocationLoading}
			/>
		);
	}

	return role === "scholar" ? (
		<ScholarHome />
	) : (
		<StudentHome insets={insets} />
	);
}
