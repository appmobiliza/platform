import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { AddressRouteInput } from "../subcomponents/address-route-input";
import { SheetFrame, StageSheet } from "../subcomponents/layout";
import type { Place, Stage } from "../types";
import type { StageBaseProps } from "./types";

interface DestinationSelectionStageProps extends StageBaseProps {
	campusLocationItems: Array<{
		name: string;
		latitude: number;
		longitude: number;
		abbreviation?: string;
		abbrev?: string;
	}>;
	campusLocationsByName: Map<
		string,
		{
			name: string;
			latitude: number;
			longitude: number;
			abbreviation?: string;
			abbrev?: string;
		}
	>;
	setOrigin: (place: Place) => void;
	setDestination: (place: Place) => void;
	transitionTo: (stage: Stage) => void;
}

function DestinationSelectionStage({
	modalRef,
	handleDismiss,
	isDark,
	destination,
	origin,
	campusLocationItems,
	campusLocationsByName,
	setOrigin,
	setDestination,
	transitionTo,
	dismissAndExit,
}: DestinationSelectionStageProps) {
	return (
		<StageSheet
			stage="destination-selection"
			modalRef={modalRef}
			onDismiss={handleDismiss}
			snapPoints={["85%"]}
			colorScheme={isDark ? "dark" : "light"}
			panDownToClose
		>
			<SheetFrame
				title="Selecione seu destino"
				footer={
					<>
						<Button
							onPress={() => transitionTo("start-confirm")}
							disabled={destination === null || origin === null}
						>
							<Text>Confirmar destino</Text>
						</Button>
						<Button variant="outline" onPress={dismissAndExit}>
							<Text>Cancelar</Text>
						</Button>
					</>
				}
			>
				<AddressRouteInput
					origin={origin}
					destination={destination}
					locations={campusLocationItems}
					onSelectOrigin={(name, isCurrent) => {
						if (isCurrent) return;
						const point = campusLocationsByName.get(name);
						if (point) {
							setOrigin({
								name: point.name,
								abbreviation: point.abbreviation,
								latitude: point.latitude,
								longitude: point.longitude,
							});
						}
					}}
					onSelectDestination={(name) => {
						const point = campusLocationsByName.get(name);
						if (point) {
							setDestination({
								name: point.name,
								abbreviation: point.abbreviation,
								latitude: point.latitude,
								longitude: point.longitude,
							});
						}
					}}
				/>
			</SheetFrame>
		</StageSheet>
	);
}

export { DestinationSelectionStage };
