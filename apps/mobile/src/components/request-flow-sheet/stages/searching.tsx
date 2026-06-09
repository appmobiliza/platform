import { ClockAlert, Timer } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";

import { AddressRoute } from "@/components/address";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { SheetFrame, StageSheet } from "../subcomponents/layout";
import { SearchIndicator } from "../subcomponents/seach-indicator";
import type { StageBaseProps } from "./types";

interface SearchingStageProps extends StageBaseProps {
	searchState: "idle" | "searching" | "unattended" | "error";
	elapsedSeconds: number;
}

function SearchingStage({
	modalRef,
	handleDismiss,
	isDark,
	searchState,
	dismissAndExit,
	origin,
	destination,
	elapsedSeconds,
}: SearchingStageProps) {
	return (
		<StageSheet
			stage="searching"
			modalRef={modalRef}
			onDismiss={handleDismiss}
			colorScheme={isDark ? "dark" : "light"}
		>
			{searchState === "unattended" ? (
				<SheetFrame
					title="Nenhum contribuinte encontrado"
					footer={
						<Button variant="destructive" onPress={dismissAndExit}>
							<Text>Fechar</Text>
						</Button>
					}
					shouldWrapChildren
				>
					<View className="items-center gap-4 py-2">
						<View className="size-16 items-center justify-center rounded-full bg-destructive/20">
							<Icon
								icon={ClockAlert}
								size={28}
								color="--destructive-foreground"
							/>
						</View>
						<Text className="text-center text-base leading-6 text-foreground">
							Nenhum contribuente aceitou sua solicitação no tempo
							esperado.{"\n\n"}
							Tente novamente mais tarde ou entre em contato com o
							NAC.
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
			) : searchState === "error" ? (
				<SheetFrame
					title="Erro ao criar solicitação"
					footer={
						<Button onPress={dismissAndExit}>
							<Text>Voltar</Text>
						</Button>
					}
					shouldWrapChildren
				>
					<View className="items-center gap-4 py-2">
						<View className="size-16 items-center justify-center rounded-full bg-destructive/20">
							<Icon
								icon={ClockAlert}
								size={28}
								color="--destructive-foreground"
							/>
						</View>
						<Text className="text-center text-base leading-6 text-foreground">
							Não foi possível criar sua solicitação.{"\n\n"}
							Verifique sua conexão e tente novamente.
						</Text>
					</View>
				</SheetFrame>
			) : (
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
					shouldWrapChildren
				>
					<View className="items-center gap-4 py-2">
						<SearchIndicator />
						<View className="flex-row items-center gap-2">
							<Icon
								icon={Timer}
								size={16}
								color="--muted-foreground"
							/>
							<Text className="text-sm text-muted-foreground">
								{elapsedSeconds < 60
									? `${elapsedSeconds}s`
									: `${Math.floor(elapsedSeconds / 60)}m${elapsedSeconds % 60}s`}
							</Text>
						</View>
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
			)}
		</StageSheet>
	);
}

export { SearchingStage };
