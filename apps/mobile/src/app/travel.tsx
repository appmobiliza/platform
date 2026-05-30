import { useState } from "react";

import { useRouter } from "expo-router";
import { ChevronLeft, Clock } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
				className="bg-primary px-6 rounded-b-3xl pb-8"
				style={{ paddingTop: insets.top + 16 }}
			>
				{/* Top Nav */}
				<View className="flex-row items-center justify-between mb-8">
					<ChevronLeft
						color="#FFFFFF"
						size={28}
						onPress={() => router.back()}
						className="p-2 -ml-2"
					/>

					{/* Header Right Content (Avatar and Timer) */}
					<View className="flex-row items-center">
						<View className="bg-primary-foreground/20 px-3 py-1.5 rounded-full flex-row items-center">
							<Clock
								color="#FFFFFF"
								size={14}
								className="mr-1.5"
							/>
							<Text className="text-primary-foreground text-sm font-semibold">
								{isDuring ? "05:21" : "00:00"}
							</Text>
						</View>
					</View>
				</View>

				{/* Student Profile Info */}
				<View className="flex-row items-center">
					<Avatar
						alt="Maria Aparecida's Avatar"
						className="h-16 w-16 mr-4 bg-[#E6F4F5]"
					>
						<AvatarFallback>
							<Text className="text-[#005E65] font-bold text-xl">
								MA
							</Text>
						</AvatarFallback>
					</Avatar>
					<View>
						<Text className="font-bold text-2xl text-primary-foreground mb-1">
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
				showsVerticalScrollIndicator={false}
			>
				{/* Route Card */}
				<View className="mb-6">
					<Text className="text-muted-foreground font-semibold text-xs mb-3 tracking-widest uppercase">
						PERCURSO
					</Text>
					<View className="bg-card border border-border rounded-2xl p-5">
						<View className="flex-row items-start mb-1">
							<View className="w-5 h-5 rounded-full bg-info items-center justify-center mr-3 mt-0.5">
								<View className="w-2 h-2 bg-white rounded-full" />
							</View>
							<View>
								<Text className="text-foreground font-bold text-base">
									Instituto de Computação
								</Text>
								<Text className="text-muted-foreground text-sm">
									Ponto de partida
								</Text>
							</View>
						</View>

						<View className="w-0.5 h-8 bg-border ml-2.5 my-1" />

						<View className="flex-row items-start">
							<View className="w-5 h-5 rounded-full bg-primary items-center justify-center mr-3 mt-0.5">
								<View className="w-2 h-2 bg-white rounded-full" />
							</View>
							<View>
								<Text className="text-foreground font-bold text-base">
									Biblioteca Central
								</Text>
								<Text className="text-muted-foreground text-sm">
									Destino
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Observation Card */}
				<View className="mb-6">
					<Text className="text-muted-foreground font-semibold text-xs mb-3 tracking-widest uppercase">
						OBSERVAÇÃO DO ESTUDANTE
					</Text>
					<View className="bg-secondary rounded-2xl p-4">
						<Text className="text-foreground leading-relaxed font-medium">
							"Prefere áudio descrição contínua durante todo o
							percurso."
						</Text>
					</View>
				</View>

				{/* Extra Info during travel */}
				{isDuring && (
					<View className="flex-row gap-4 mb-6">
						<View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center justify-center">
							<Text className="text-muted-foreground text-sm mb-1">
								Início
							</Text>
							<Text className="text-foreground font-bold text-lg">
								10h17
							</Text>
						</View>
						<View className="flex-1 bg-card border border-border rounded-2xl p-4 items-center justify-center">
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
			<View className="px-6 pb-8 pt-4 bg-background">
				{isDuring ? (
					<Button
						onPress={() => router.back()}
						className="w-full rounded-2xl h-14 mb-4"
					>
						<Text className="font-semibold text-base text-white">
							Concluir atendimento
						</Text>
					</Button>
				) : (
					<Button
						onPress={() => setIsDuring(true)}
						className="w-full rounded-2xl h-14 bg-card border border-border mb-4"
						variant="outline"
					>
						<Text className="font-semibold text-base text-muted-foreground">
							Aguardando encontro...
						</Text>
					</Button>
				)}

				<View className="items-center">
					<Text className="text-muted-foreground font-medium py-2">
						Reportar problema
					</Text>
				</View>
			</View>
		</View>
	);
}
