import { MapPin } from "lucide-react-native";
import { ActivityIndicator } from "react-native";

import { PlaceCard } from "@/components/place-card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { SheetFrame, StageSheet } from "../subcomponents/layout";
import type { Stage } from "../types";
import type { StageBaseProps } from "./types";

interface StartConfirmStageProps extends StageBaseProps {
	confirmRequest: () => void;
	isCreating: boolean;
	transitionTo: (stage: Stage) => void;
}

function StartConfirmStage({
	modalRef,
	handleDismiss,
	isDark,
	origin,
	destination,
	confirmRequest,
	isCreating,
	transitionTo,
	dismissAndExit,
}: StartConfirmStageProps) {
	return (
		<StageSheet
			stage="start-confirm"
			modalRef={modalRef}
			onDismiss={handleDismiss}
			colorScheme={isDark ? "dark" : "light"}
		>
			<SheetFrame
				title="Confirme seu ponto de partida"
				footer={
					<>
						<Button
							onPress={() => confirmRequest()}
							disabled={!origin || !destination || isCreating}
						>
							<Text>
								{isCreating ? "Criando..." : "Confirmar"}
							</Text>
							{isCreating && (
								<ActivityIndicator size={16} color="white" />
							)}
						</Button>
						<Button variant="outline" onPress={dismissAndExit}>
							<Text>Cancelar</Text>
						</Button>
					</>
				}
				shouldWrapChildren
			>
				<PlaceCard
					className="px-4 py-2 border-none"
					title={origin?.abbreviation ?? origin?.name ?? ""}
					description={`${origin?.abbreviation ? `${origin?.abbreviation} - ` : ""}${origin?.name ?? ""}`}
					variant="default"
					icon={{ as: MapPin, color: "--foreground" }}
				>
					<Button
						variant="inverted"
						size="sm"
						onPress={() => transitionTo("destination-selection")}
					>
						<Text>Alterar</Text>
					</Button>
				</PlaceCard>
			</SheetFrame>
		</StageSheet>
	);
}

export { StartConfirmStage };
