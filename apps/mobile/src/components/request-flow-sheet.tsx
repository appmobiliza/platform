import {
	CircleX,
	MapPin,
	MessageSquareText,
	PencilLine,
	Search,
	UserRoundSearch,
	UsersRound,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";

import { Address, AddressRoute } from "@/components/address";
import { PlaceCard } from "@/components/place-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

import { SheetFrame, StageSheet } from "./request-flow-sheet/components";
import { DestinationSelector } from "./request-flow-sheet/destination-selector";
import { SearchIndicator } from "./request-flow-sheet/seach-indicator";
import { useRequestFlow } from "./request-flow-sheet/use-request-flow";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Icon } from "./ui/icon";
import {
	inputClassName,
	inputNativeClassName,
	inputWebClassName,
} from "./ui/input";

function RequestFlowSheet() {
	const {
		destinationRef,
		destinationSelectionRef,
		destinationValue,
		dismissAndExit,
		handleDismiss,
		message,
		originSummary,
		searchingRef,
		setDestinationValue,
		setMessage,
		startConfirmRef,
		transitionTo,
		tripRef,
	} = useRequestFlow();

	return (
		<View className="absolute inset-0" pointerEvents="box-none">
			<StageSheet
				stage="destination"
				modalRef={destinationRef}
				onDismiss={handleDismiss}
			>
				<SheetFrame
					title="Insira seu destino"
					subtitle="Arraste o mapa para mover o marcador"
					headerPosition="center"
					footer={
						<Button
							onPress={() =>
								transitionTo("destination-selection")
							}
						>
							<Text>
								{destinationValue ? "Confirmar" : "Selecionar"}{" "}
								destino
							</Text>
						</Button>
					}
				>
					<Pressable
						className={cn(
							"justify-between px-3",
							inputClassName,
							inputNativeClassName,
							inputWebClassName,
						)}
						onPress={() => transitionTo("destination-selection")}
					>
						<View className="gap-4 flex-row items-center justify-start">
							<Icon
								icon={MapPin}
								size={20}
								color="--muted-foreground"
							/>
							<Text className="pb-0.5">
								{destinationValue ||
									"Digite um destino para começar a procurar por contribuintes próximos a você."}
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
				panDownToClose
			>
				<SheetFrame
					title="Selecione seu destino"
					footer={
						<>
							<Button
								onPress={() => transitionTo("start-confirm")}
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
							label: "Instituto de Computação",
						}}
						to={{
							label: destinationValue,
							children: (
								<Pressable className="text-secondary-foreground">
									<Icon
										icon={CircleX}
										size={20}
										color="--secondary-foreground"
									/>
								</Pressable>
							),
						}}
						shouldShowRoute
					/>

					<DestinationSelector
						selectedDestination={destinationValue}
						onSelectDestination={setDestinationValue}
					/>

					{/*<PlaceCard
						title="Locais salvos"
						subtitle="Acesse suas rotas favoritas"
						icon={{
							name: "star",
							className: "rounded-full w-12 h-12",
						}}
						className="rounded-none border-l-0 border-r-0 border-b-0 border-t border-border"
					/>*/}
				</SheetFrame>
			</StageSheet>

			<StageSheet
				stage="start-confirm"
				modalRef={startConfirmRef}
				onDismiss={handleDismiss}
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
					<Address label={originSummary} marker="from">
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
						from={{ label: originSummary }}
						to={{ label: destinationValue }}
					/>
				</SheetFrame>
			</StageSheet>

			<StageSheet
				stage="trip"
				modalRef={tripRef}
				onDismiss={handleDismiss}
			>
				<SheetFrame
					title="Vá até o ponto de partida"
					subtitle="ICAT - Instituto de Ciências Atmosféricas"
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
							label: destinationValue,
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
