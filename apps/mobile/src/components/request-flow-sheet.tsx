import {
	CircleX,
	MapPin,
	MessageSquareText,
	PencilLine,
	Search,
	UsersRound,
} from "lucide-react-native";
import { ActivityIndicator, TextInput, View } from "react-native";

import { Address, AddressRoute } from "@/components/address";
import { PlaceCard } from "@/components/place-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { SheetFrame, StageSheet } from "./request-flow-sheet/components";
import { DESTINATION_OPTIONS } from "./request-flow-sheet/types";
import { useRequestFlow } from "./request-flow-sheet/use-request-flow";
import { Icon } from "./ui/icon";
import { Input, InputWrapper } from "./ui/input";

function RequestFlowSheet() {
	const {
		destinationRef,
		destinationSelectionRef,
		destinationValue,
		dismissAndExit,
		handleDismiss,
		message,
		originLabel,
		originSummary,
		searchingRef,
		setDestinationValue,
		setMessage,
		setOriginLabel,
		setOriginSummary,
		startConfirmRef,
		startEditRef,
		transitionTo,
		tripRef,
	} = useRequestFlow();

	return (
		<View className="flex-1 bg-background">
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
						<>
							<Button
								onPress={() =>
									transitionTo("destination-selection")
								}
							>
								<Text>Confirmar destino</Text>
							</Button>
							<Button variant="outline" onPress={dismissAndExit}>
								<Text>Cancelar</Text>
							</Button>
						</>
					}
				>
					<InputWrapper>
						<Icon
							icon={MapPin}
							size={12}
							color={"muted-foreground"}
						/>
						<Input
							placeholder="Digite o destino"
							value={destinationValue}
							onChangeText={setDestinationValue}
						/>
						<Icon
							icon={Search}
							size={18}
							color={"muted-foreground"}
						/>
					</InputWrapper>
				</SheetFrame>
			</StageSheet>

			<StageSheet
				stage="destination-selection"
				modalRef={destinationSelectionRef}
				onDismiss={handleDismiss}
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
						from={{
							label: originLabel,
						}}
						to={{
							label: destinationValue,
							children: (
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full border border-border"
								>
									<CircleX size={16} />
								</Button>
							),
						}}
					/>

					<View className="gap-3">
						{DESTINATION_OPTIONS.map((option) => (
							<PlaceCard
								key={option.label}
								title={option.label}
								subtitle={`${option.description} • ${option.distance}`}
								iconType="map"
								onPress={() =>
									setDestinationValue(option.label)
								}
								className={
									option.highlighted ? "bg-accent" : undefined
								}
							/>
						))}
					</View>

					<PlaceCard
						title="Locais salvos"
						subtitle="Acesse suas rotas favoritas"
						iconType="star"
					/>
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
							onPress={() => transitionTo("start-edit")}
						>
							<Text>Alterar</Text>
						</Button>
					</Address>
				</SheetFrame>
			</StageSheet>

			<StageSheet
				stage="start-edit"
				modalRef={startEditRef}
				onDismiss={handleDismiss}
			>
				<SheetFrame
					title="Alterar ponto de partida"
					footer={
						<>
							<Button onPress={() => transitionTo("searching")}>
								<Text>Selecionar</Text>
							</Button>
							<Button variant="outline" onPress={dismissAndExit}>
								<Text>Cancelar</Text>
							</Button>
						</>
					}
				>
					<AddressRoute
						from={{
							label: `Localização atual (${originLabel})`,
						}}
						to={{
							label: destinationValue,
							children: (
								<Button variant="ghost" size="icon">
									<PencilLine size={16} />
								</Button>
							),
						}}
					/>

					<View className="gap-3">
						{DESTINATION_OPTIONS.map((option) => (
							<PlaceCard
								key={option.label}
								title={option.label}
								subtitle={`${option.description} • ${option.distance}`}
								iconType="map"
								onPress={() => {
									setOriginLabel(option.label);
									setOriginSummary(`${option.label}, UFAL`);
									transitionTo("start-confirm");
								}}
								className={
									option.highlighted ? "bg-accent" : undefined
								}
							/>
						))}
					</View>

					<PlaceCard
						title="Locais salvos"
						subtitle="Acesse suas rotas favoritas"
						iconType="star"
					/>
				</SheetFrame>
			</StageSheet>

			<StageSheet
				stage="searching"
				modalRef={searchingRef}
				onDismiss={handleDismiss}
			>
				<SheetFrame
					title="Procurando contribuintes..."
					accessory={
						<View className="flex-row gap-2">
							<View className="h-1.5 flex-1 rounded-full bg-primary" />
							<View className="h-1.5 flex-1 rounded-full bg-primary" />
							<View className="h-1.5 flex-1 rounded-full bg-primary" />
							<View className="h-1.5 flex-1 rounded-full bg-border" />
						</View>
					}
					footer={
						<>
							<Button disabled>
								<Text>Procurando</Text>
								<ActivityIndicator size="small" color="white" />
							</Button>
							<Button variant="outline" onPress={dismissAndExit}>
								<Text>Cancelar</Text>
							</Button>
						</>
					}
				>
					<View className="items-center gap-4 py-2">
						<View className="size-16 items-center justify-center rounded-full bg-primary">
							<UsersRound size={28} color="white" />
						</View>
						<Text className="max-w-[290px] text-center text-[16px] leading-6 text-foreground">
							Aguarde um pouco enquanto procuramos. O tempo médio
							de espera é de 1-10m.
						</Text>
					</View>

					<AddressRoute
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
					<View className="gap-3 rounded-2xl border border-border bg-card px-4 py-4">
						<View className="flex-row items-start gap-3">
							<View className="size-12 items-center justify-center overflow-hidden rounded-full bg-primary/30">
								<Text className="text-[20px]">🐸</Text>
							</View>
							<View className="flex-1 gap-2">
								<View className="flex-row items-center justify-between gap-3">
									<Text className="text-[16px] font-semibold leading-6 text-foreground">
										João Carlos
									</Text>
									<Text className="text-[14px] leading-5 text-muted-foreground">
										desde ago/2024
									</Text>
								</View>
								<View className="self-start rounded-full bg-secondary px-3 py-1">
									<Text className="text-[12px] font-medium leading-4 text-secondary-foreground">
										Manhã
									</Text>
								</View>
							</View>
						</View>
						<View className="rounded-xl bg-secondary px-4 py-3">
							<View className="flex-row items-center gap-3">
								<Icon
									icon={MessageSquareText}
									size={17}
									color={"muted-foreground"}
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
						from={{
							label: `ICAT - Instituto de Ciências Atmosféricas`,
						}}
						to={{
							label: destinationValue,
							children: (
								<Button variant="ghost" size="icon">
									<PencilLine size={16} />
								</Button>
							),
						}}
					/>
				</SheetFrame>
			</StageSheet>
		</View>
	);
}

export { RequestFlowSheet };
