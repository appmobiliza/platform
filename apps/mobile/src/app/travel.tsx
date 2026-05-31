import { useState } from "react";

import { useRouter } from "expo-router";
import { ChevronLeft, Clock } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressRoute } from "@/components/address";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function TravelScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();

	// Estado simulando a progressão da viagem: false = "Aguardando encontro", true = "Em andamento"
	const [isDuring, setIsDuring] = useState(false);

	return (
		<View className="flex-1 bg-background">
			{/* Header */}
			<View
				className="bg-primary px-6 pb-8 gap-6"
				style={{ paddingTop: insets.top + 24 }}
			>
				{/* Top Nav */}
				<View className="flex-row items-center justify-between">
					<ChevronLeft
						color="#FFFFFF"
						size={32}
						onPress={() => router.back()}
					/>

					{/* Header Right Content (Avatar and Timer) */}
					<View className="flex-row items-center">
						<View className="bg-primary-foreground/20 px-3 py-1.5 rounded-full flex-row items-center">
							<Clock
								color="#FFFFFF"
								size={14}
								className="mr-1.5"
							/>
							<Text className="text-primary-foreground text-sm mb-0.5 font-semibold">
								{isDuring ? "05:21" : "00:00"}
							</Text>
						</View>
					</View>
				</View>

				{/* Student Profile Info */}
				<View className="flex-row items-center">
					<Avatar
						alt="Maria Aparecida's Avatar"
						className="h-16 w-16 mr-4"
					>
						<AvatarFallback>
							<Text>MA</Text>
						</AvatarFallback>
					</Avatar>
					<View>
						<Text className="font-bold text-2xl text-primary-foreground">
							Maria Aparecida
						</Text>
						<Text className="text-primary-foreground/80 font-medium">
							Deficiência visual
						</Text>
					</View>
				</View>
			</View>

			<ScrollView
				className="flex-1 px-6 pt-6"
				contentContainerClassName="gap-4"
				showsVerticalScrollIndicator={false}
			>
				{/* Route Card */}
				<View className="p-5 bg-card border border-border rounded-lg">
					<Text className="text-muted-foreground font-semibold text-xs mb-3 tracking-widest uppercase">
						PERCURSO
					</Text>
					<AddressRoute
						from={{
							label: "Instituto de Computação",
							description: "Ponto de partida",
						}}
						to={{
							label: "Biblioteca Central",
							description: "Destino",
						}}
						shouldShowRoute
						size="lg"
					/>
				</View>

				{/* Observation Card */}
				<View className="bg-card p-4 border border-border rounded-lg">
					<Text className="text-muted-foreground font-semibold text-xs mb-3 tracking-widest uppercase">
						OBSERVAÇÃO DO ESTUDANTE
					</Text>
					<Text className="text-foreground leading-relaxed font-medium">
						"Prefere áudio descrição contínua durante todo o
						percurso."
					</Text>
				</View>

				{/* Extra Info during travel */}
				{isDuring && (
					<View className="flex-row gap-4 mb-6">
						<View className="flex-1 bg-card border border-border rounded-lg p-4 items-center justify-center">
							<Text className="text-muted-foreground text-sm mb-1">
								Início
							</Text>
							<Text className="text-foreground font-bold text-lg">
								10h17
							</Text>
						</View>
						<View className="flex-1 bg-card border border-border rounded-lg p-4 items-center justify-center">
							<Text className="text-muted-foreground text-sm mb-1 text-center">
								Distância restante
							</Text>
							<Text className="text-foreground font-bold text-lg">
								2,1km
							</Text>
						</View>
					</View>
				)}
			</ScrollView>

			{/* Footer Actions */}
			<View className="px-6 pb-8 pt-4 gap-2">
				{isDuring ? (
					<Button
						size="lg"
						onPress={() => router.back()}
						className="w-full rounded-xl py-7"
					>
						<Text>Concluir atendimento</Text>
					</Button>
				) : (
					<Button
						size="lg"
						onPress={() => setIsDuring(true)}
						className="w-full rounded-xl py-7"
					>
						<Text>Aguardando encontro...</Text>
					</Button>
				)}

				<Button
					variant="outline"
					className="bg-transparent dark:bg-transparent"
					size={"lg"}
				>
					<Text>Reportar problema</Text>
				</Button>
			</View>
		</View>
	);
}
