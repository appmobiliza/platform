import { useState } from "react";

import { useRouter } from "expo-router";
import {
	Accessibility,
	Clock,
	Palmtree,
	Play,
	Power,
} from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { Logo } from "@/assets/logo";

import { Icon } from "../ui/icon";
import { PendingRequestCard } from "./pending-request-card";

type ShiftState = "out" | "pre" | "waiting" | "pending";

export function ScholarHome() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	// Temporário para podermos visualizar todos os estados solicitados no Figma
	const [shiftState, setShiftState] = useState<ShiftState>("out");

	const renderHeaderPill = () => {
		if (shiftState === "out") {
			return (
				<View className="bg-primary-foreground/10 px-3 py-1.5 rounded-full flex-row items-center">
					<View className="w-2 h-2 rounded-full bg-muted-foreground mr-2" />
					<Text className="text-primary-foreground text-sm font-medium">
						Fora de turno
					</Text>
				</View>
			);
		}

		if (shiftState === "pending") {
			return (
				<View className="bg-primary-foreground/10 px-3 py-1.5 rounded-full flex-row items-center">
					<View className="w-2 h-2 rounded-full bg-[#EAB308] mr-2" />
					<Text className="text-primary-foreground text-sm font-medium">
						1 pendente
					</Text>
				</View>
			);
		}

		return (
			<View className="bg-primary-foreground/10 px-3 py-1.5 rounded-full flex-row items-center">
				<View className="w-2 h-2 rounded-full bg-[#5DCAA5] mr-2" />
				<Text className="text-primary-foreground text-sm font-medium">
					Disponível
				</Text>
			</View>
		);
	};

	const renderMainContent = () => {
		switch (shiftState) {
			case "out":
				return (
					<>
						{/* Countdown Pill */}
						<View className="bg-secondary rounded-full py-3 mb-6 items-center justify-center">
							<Text className="text-secondary-foreground font-medium">
								Restam 16h para o início do turno
							</Text>
						</View>

						{/* Empty State Card */}
						<View className="border border-border rounded-[32px] flex-1 items-center justify-center p-6">
							<Icon
								icon={Palmtree}
								color="--foreground"
								size={56}
							/>
							<Text className="text-2xl font-bold text-foreground text-center mt-6 mb-3">
								Seu turno ainda não{"\n"}começou
							</Text>
							<Text className="text-center text-muted-foreground text-base leading-tight">
								Caso precise compensar horas,{"\n"}
								você pode iniciar um turno extra
							</Text>
							{/* Botão de turno extra omitido conforme escopo */}
						</View>
					</>
				);
			case "pre":
				return (
					<>
						{/* Start Shift Button */}
						<Button
							onPress={() => setShiftState("waiting")}
							className="rounded-2xl h-14 mb-6"
						>
							<Play size={20} color="#FFFFFF" className="mr-2" />
							<Text className="font-semibold text-base text-white">
								Iniciar turno
							</Text>
						</Button>

						{/* Empty State Card */}
						<View className="border border-border rounded-[32px] flex-1 items-center justify-center p-6">
							<Text className="text-center text-muted-foreground text-base leading-tight">
								Inicie seu turno para{"\n"}
								visualizar as solicitações
							</Text>
						</View>
					</>
				);
			case "waiting":
			case "pending":
				return (
					<ScrollView
						className="flex-1"
						showsVerticalScrollIndicator={false}
					>
						{/* End Shift Button */}
						<Button
							variant="outline"
							onPress={() => setShiftState("out")}
							className="rounded-2xl h-14 mb-8 border-border bg-transparent"
						>
							<Power
								size={20}
								color="currentColor"
								className="text-foreground mr-2"
							/>
							<Text className="font-semibold text-base text-foreground">
								Encerrar turno
							</Text>
						</Button>

						{shiftState === "pending" ? (
							<>
								<Text className="font-bold text-lg text-foreground mb-4">
									Aguardando resposta
								</Text>
								<PendingRequestCard
									onAccept={() => {
										// In a real flow, this would call the API.
										// Here we navigate to the Travel screen to see the Active state.
										router.push("/travel");
									}}
									onReject={() => setShiftState("waiting")}
								/>
							</>
						) : (
							<View className="items-center justify-center mb-10 mt-4">
								<View className="bg-secondary w-16 h-16 rounded-full items-center justify-center mb-4">
									<Accessibility
										size={32}
										color="currentColor"
										className="text-foreground"
									/>
								</View>
								<Text className="text-center text-foreground font-medium text-lg">
									Aguardando novas{"\n"}solicitações...
								</Text>
							</View>
						)}

						{/* Today's Services */}
						<View>
							<Text className="font-bold text-lg text-foreground mb-4">
								Atendimentos hoje
							</Text>

							{/* Mock Service Card 1 */}
							<View className="bg-card border border-border rounded-[24px] p-4 mb-4">
								<View className="flex-row items-center justify-between mb-4">
									<View className="flex-row items-center">
										<Avatar
											alt="Rodrigo Santos's Avatar"
											className="h-12 w-12 mr-3 bg-[#E6F4F5]"
										>
											<AvatarFallback>
												<Text className="text-[#005E65] font-bold">
													RS
												</Text>
											</AvatarFallback>
										</Avatar>
										<View>
											<Text className="font-bold text-base text-foreground">
												Rodrigo Santos
											</Text>
											<Text className="text-sm text-muted-foreground">
												Deficiência física motora
											</Text>
										</View>
									</View>
									<Text className="text-[#1D9E75] text-xs font-semibold">
										Concluído
									</Text>
								</View>

								<View className="flex-row items-center justify-between pt-3 border-t border-border">
									<Text
										className="text-muted-foreground text-sm flex-1"
										numberOfLines={1}
									>
										📍 FAED → Biblioteca Central
									</Text>
									<Text className="text-muted-foreground text-sm ml-2">
										🕒 9h14 - 12m
									</Text>
								</View>
							</View>
						</View>
					</ScrollView>
				);
		}
	};

	return (
		<View className="flex-1 bg-background">
			{/* Header (Blue) */}
			<View
				className="bg-primary px-6 rounded-b-3xl pb-8"
				style={{ paddingTop: insets.top + 24 }}
			>
				{/* Top Row: Greeting and Status Pill */}
				<View className="flex-row items-center justify-between mb-4">
					<Text
						className="text-primary-foreground font-medium text-base"
						// Temporário: Clicar no nome alterna o estado para podermos testar a UI
						onPress={() =>
							setShiftState((prev) =>
								prev === "out"
									? "pre"
									: prev === "pre"
										? "waiting"
										: prev === "waiting"
											? "pending"
											: "out",
							)
						}
					>
						Olá, Isabela 👋
					</Text>
					{renderHeaderPill()}
				</View>

				{/* Logo */}
				<View className="mb-6">
					<Logo fill="#FFFFFF" height={28} width={160} />
				</View>

				{/* Shift Info Card */}
				<View className="bg-black/20 rounded-2xl p-4 flex-row items-center justify-between">
					<View className="flex-row items-center">
						<Clock color="#FFFFFF" size={18} />
						<Text className="text-primary-foreground ml-3 font-medium text-base">
							Turno matutino
						</Text>
					</View>
					<Text className="text-primary-foreground text-base">
						12h - 19h
					</Text>
				</View>
			</View>

			{/* Main Content */}
			<View className="flex-1 px-6 pt-6 pb-2">{renderMainContent()}</View>
		</View>
	);
}
