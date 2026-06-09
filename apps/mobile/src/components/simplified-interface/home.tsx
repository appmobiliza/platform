import { useRouter } from "expo-router";
import { LocateFixed, MapPin, MousePointer2 } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Place } from "@/components/request-flow-sheet/types";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { PlaceCard } from "../place-card";

interface Props {
	nearestPoint: Place | null;
	campusLocations: Place[];
}

export default function SimplifiedHome({
	nearestPoint,
	campusLocations,
}: Props) {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	return (
		<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
			<View
				className="bg-primary pb-8 px-4 flex justify-start items-start mb-8"
				style={{
					paddingTop: insets.top + 64,
				}}
			>
				<Text className="uppercase text-lg font-semibold mb-2">
					OLÁ, PEDRO
				</Text>
				<Text className="text-4xl font-extrabold">
					Para onde vamos?
				</Text>
			</View>
			<View className="p-4 gap-4">
				<View
					className="bg-card rounded-lg p-4 flex-row items-center justify-between gap-4 border border-border"
					accessible
					accessibilityLabel={`Você está em ${nearestPoint?.name ?? "localização não disponível"}`}
				>
					<View className="flex-1 gap-4 flex-row items-center justify-start">
						<View className="items-center justify-center gap-1 p-4 rounded-md bg-primary">
							<Icon
								icon={LocateFixed}
								color={"white"}
								size={28}
							/>
						</View>
						<View className="flex-1">
							<Text
								className="font-medium text-base uppercase text-muted-foreground"
								numberOfLines={1}
							>
								Você está em
							</Text>
							<Text
								className="text-xl mt-0.5 font-extrabold"
								numberOfLines={3}
							>
								{nearestPoint?.name}
							</Text>
						</View>
					</View>
				</View>

				<Pressable
					className="bg-primary rounded-lg p-4 flex-row items-center justify-between gap-4 border border-border active:opacity-70"
					onPress={() => router.push("/acessible-request")}
					accessible
					accessibilityRole="button"
					accessibilityLabel="Solicitar deslocamento"
					accessibilityHint="Toque para abrir o assistente de voz e solicitar um deslocamento"
				>
					<View className="flex-1 gap-4 flex-row items-center justify-start">
						<View className="items-center justify-center gap-1 p-4 rounded-md bg-white/20">
							<Icon
								icon={MousePointer2}
								color={"white"}
								size={28}
							/>
						</View>
						<View className="flex-1">
							<Text className="text-3xl font-extrabold mr-8">
								Solicitar deslocamento
							</Text>
							<Text
								className="font-medium text-base"
								numberOfLines={1}
							>
								Escolha o destino
							</Text>
						</View>
					</View>
				</Pressable>

				<Text className="text-2xl font-extrabold mt-4">
					Rotas recentes
				</Text>

				<View className="flex-col gap-3">
					<PlaceCard
						size="accessibility"
						title="Restaurante Universitário"
						description="Último deslocamento há 2 dias"
						icon={{ as: MapPin }}
						onPress={() => {}}
					/>
					<PlaceCard
						size="accessibility"
						title="Reitoria"
						description="Último deslocamento há 6 dias"
						icon={{ as: MapPin }}
						onPress={() => {}}
					/>
					<PlaceCard
						size="accessibility"
						title="Biblioteca Central"
						description="Último deslocamento há 10 dias"
						icon={{ as: MapPin }}
						onPress={() => {}}
					/>
					<PlaceCard
						size="accessibility"
						title="Instituto de Computação"
						description="Último deslocamento há 12 dias"
						icon={{ as: MapPin }}
						onPress={() => {}}
					/>
				</View>
			</View>
		</ScrollView>
	);
}
