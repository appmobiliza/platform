import { MapPin, Search } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { cn } from "@/lib/utils";

import { SheetFrame, StageSheet } from "../subcomponents/layout";
import type { Stage } from "../types";
import type { StageBaseProps } from "./types";

interface DestinationStageProps extends StageBaseProps {
	transitionTo: (stage: Stage) => void;
}

function DestinationStage({
	modalRef,
	handleDismiss,
	isDark,
	destination,
	transitionTo,
}: DestinationStageProps) {
	return (
		<StageSheet
			stage="destination"
			modalRef={modalRef}
			onDismiss={handleDismiss}
			colorScheme={isDark ? "dark" : "light"}
		>
			<SheetFrame
				title="Insira seu destino"
				description="Arraste o mapa para mover o marcador"
				headerPosition="center"
				footer={
					<Button
						onPress={() => transitionTo("destination-selection")}
					>
						<Text>
							{destination ? "Confirmar" : "Selecionar"} destino
						</Text>
					</Button>
				}
				shouldWrapChildren
			>
				<Pressable
					className={cn(
						"justify-between px-3 dark:bg-input/50 border-border dark:border-input flex h-11 w-full min-w-0 flex-row items-center rounded-md border py-1 text-base text-foreground shadow-sm shadow-black/5 sm:h-9 pl-3",
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
					<Icon icon={Search} size={20} color="--muted-foreground" />
				</Pressable>
			</SheetFrame>
		</StageSheet>
	);
}

export { DestinationStage };
