import { useCallback } from "react";

import {
	CircleX,
	MapPin,
	MessageSquareText,
	Search,
} from "lucide-react-native";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	TextInput,
	useColorScheme,
	View,
} from "react-native";

import { Address, AddressRoute } from "@/components/address";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

import { ufalPoints } from "@/constants/locations";

import { SheetFrame, StageSheet } from "./components";
import { DestinationSelector } from "./destination-selector";
import { SearchIndicator } from "./seach-indicator";
import { useRequestFlow } from "./use-request-flow";

function RequestFlowSheet() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	const {
		destinationRef,
		destinationSelectionRef,
		destination,
		dismissAndExit,
		handleDismiss,
		message,
		origin,
		searchingRef,
		setDestination,
		setMessage,
		startConfirmRef,
		transitionTo,
		tripRef,
	} = useRequestFlow();

	const handleSelectDestination = useCallback(
		(name: string) => {
			const point = ufalPoints.find((p) => p.name === name);
			if (point) {
				setDestination({
					name: point.name,
					abbreviation: point.abbrev,
					latitude: point.latitude,
					longitude: point.longitude,
				});
			}
		},
		[setDestination],
	);

	console.log("destination", destination);

	return (
		<View className="absolute inset-0" pointerEvents="box-none">
			<StageSheet
				stage="destination"
				modalRef={destinationRef}
				onDismiss={handleDismiss}
				colorScheme={isDark ? "dark" : "light"}
			>
				<SheetFrame
					title="Insira seu destino"
					description="Arraste o mapa para mover o marcador"
					headerPosition="center"
					footer={
						<Button
							onPress={() =>
								transitionTo("destination-selection")
							}
						>
							<Text>
								{destination ? "Confirmar" : "Selecionar"}{" "}
								destino
							</Text>
						</Button>
					}
				>
					<Pressable
						className={cn(
							"justify-between px-3 dark:bg-input/50 border-border dark:border-input bg-red-500 flex h-11 w-full min-w-0 flex-row items-center rounded-md border py-1 text-base text-foreground shadow-sm shadow-black/5 sm:h-9 pl-3",
						)}
						onPress={() => transitionTo("destination-selection")}
					>
						<View className="gap-4 flex-row items-center justify-start">
							<Icon
								icon={MapPin}
								size={20}
								color="--muted-foreground"
							/>
							<Text className="mb">
								{destination?.name ?? "Digite um destino"}
							</Text>
						</View>
						<Icon
							icon={Search}
							size={20}
							color="--muted-foreground"
						/>
					</Pressable>
				</SheetFrame>
			</StageSheet>

			<StageSheet
				stage="destination-selection"
				modalRef={destinationSelectionRef}
				onDismiss={handleDismiss}
				// snapPoints={["85%"]}
				colorScheme={isDark ? "dark" : "light"}
				panDownToClose
			>
				<SheetFrame
					title="Selecione seu destino"
					// scrollable={false}
					footer={
						<>
							<Button
								onPress={() => transitionTo("start-confirm")}
								disabled={destination === null}
							>
								<Text>Confirmar destino</Text>
							</Button>
							<Button variant="outline" onPress={dismissAndExit}>
								<Text>Cancelar</Text>
							</Button>
						</>
					}
				>
					<AddressRoute
						className="bg-input p-4 rounded-lg"
						from={{
							label: `${
								origin?.abbreviation ?? origin?.name ?? ""
							} - ${origin?.name ?? ""}`,
						}}
						to={{
							label: destination?.name ?? "",
							children: destination !== null && (
								<Pressable
									className="text-secondary-foreground"
									onPress={() => setDestination(null)}
								>
									<Icon
										icon={CircleX}
										size={20}
										color="--secondary-foreground"
									/>
								</Pressable>
							),
						}}
						shouldShowRoute
						size="md"
					/>

					<DestinationSelector
						selectedDestination={destination?.name}
						onSelectDestination={handleSelectDestination}
					/>
				</SheetFrame>
			</StageSheet>

			<StageSheet
				stage="start-confirm"
				modalRef={startConfirmRef}
				onDismiss={handleDismiss}
				colorScheme={isDark ? "dark" : "light"}
			>
				<SheetFrame
					title="Confirme seu ponto de partida"
					footer={
						<>
							<Button onPress={() => transitionTo("searching")}>
								<Text>Confirmar</Text>
							</Button>
							<Button variant="outline" onPress={dismissAndExit}>
								<Text>Cancelar</Text>
							</Button>
						</>
					}
				>
					<Address
						label={origin?.abbreviation ?? origin?.name ?? ""}
						marker="from"
					>
						<Button
							variant="inverted"
							size="sm"
							onPress={() =>
								transitionTo("destination-selection")
							}
						>
							<Text>Alterar</Text>
						</Button>
					</Address>
				</SheetFrame>
			</StageSheet>

			<StageSheet
				stage="searching"
				modalRef={searchingRef}
				onDismiss={handleDismiss}
				colorScheme={isDark ? "dark" : "light"}
			>
				<SheetFrame
					title="Procurando contribuintes..."
					footer={
						<>
							<Button disabled>
								<Text className="mb-0.5">Procurando</Text>
								<ActivityIndicator size={16} color="white" />
							</Button>
							<Button variant="outline" onPress={dismissAndExit}>
								<Text>Cancelar</Text>
							</Button>
						</>
					}
				>
					<View className="items-center gap-4 py-2">
						<SearchIndicator />
						<Text className="text-center text-base leading-6 text-foreground">
							Aguarde um pouco enquanto procuramos. {"\n"}O tempo
							médio de espera é de 1-10m.
						</Text>
					</View>

					<AddressRoute
						className="bg-input p-4 rounded-lg gap-4"
						from={{
							label: origin?.abbreviation ?? origin?.name ?? "",
						}}
						to={{ label: destination?.name ?? "" }}
					/>
				</SheetFrame>
			</StageSheet>

			<StageSheet
				stage="trip"
				modalRef={tripRef}
				onDismiss={handleDismiss}
				colorScheme={isDark ? "dark" : "light"}
			>
				<SheetFrame
					title="Vá até o ponto de partida"
					description={origin?.name ?? ""}
					footer={
						<Button variant="destructive" onPress={dismissAndExit}>
							<Text>Cancelar deslocamento</Text>
						</Button>
					}
				>
					<View className="gap-6 rounded-md border border-border bg-card px-4 py-4">
						<View className="flex-row items-start gap-4">
							<Avatar alt="Avatar de X" className="size-12">
								<AvatarImage
									source={{
										uri: "https://github.com/mrzachnugent.png",
									}}
								/>
								<AvatarFallback>
									<Text>ZN</Text>
								</AvatarFallback>
							</Avatar>
							<View className="flex-1 gap-0.5">
								<View className="flex-row items-center justify-between gap-3">
									<Text className="text-[16px] font-semibold leading-6 text-foreground">
										João Carlos
									</Text>
									<Text className="text-[14px] leading-5 text-muted-foreground">
										desde ago/2024
									</Text>
								</View>
								<Badge variant={"secondary"}>
									<Text>Matutino</Text>
								</Badge>
							</View>
						</View>
						<View className="rounded-md bg-secondary px-4 py-2.5">
							<View className="flex-row items-center gap-3">
								<Icon
									icon={MessageSquareText}
									size={17}
									color="--muted-foreground"
								/>
								<TextInput
									className="flex-1 text-[16px] leading-6 text-foreground"
									placeholder="Envie uma mensagem"
									value={message}
									onChangeText={setMessage}
								/>
							</View>
						</View>
					</View>

					<AddressRoute
						className="bg-input p-4 rounded-lg"
						from={{
							label: `ICAT - Instituto de Ciências Atmosféricas`,
						}}
						to={{
							label: destination?.name ?? "",
							// children: (
							// 	<Button variant="ghost" size="icon">
							// 		<Icon
							// 			icon={PencilLine}
							// 			color="--muted-foreground"
							// 			size={16}
							// 		/>
							// 	</Button>
							// ),
						}}
						maxLines={2}
						shouldShowRoute
					/>
				</SheetFrame>
			</StageSheet>
		</View>
	);
}

export { RequestFlowSheet };
