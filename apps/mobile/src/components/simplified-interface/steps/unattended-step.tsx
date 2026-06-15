import { View } from "react-native";

import { AddressRoute } from "@/components/address";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { FlowStep } from "./flow-step";
import type { StepBaseProps } from "./types";

// ─── Props ────────────────────────────────────────────────────────────────

export interface UnattendedStepProps extends StepBaseProps {
	originName: string;
	destinationName: string;
	onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function UnattendedStep({
	style,
	originName,
	destinationName,
	onClose,
}: UnattendedStepProps) {
	return (
		<View className="flex-1" style={style}>
			<FlowStep
				title="Nenhum contribuinte encontrado"
				note="Nenhum contribuinte aceitou sua solicitação no tempo esperado. Tente novamente mais tarde ou entre em contato com o NAC."
			>
				<View className="w-full gap-4 px-4">
					<AddressRoute
						className="bg-card border border-border p-4 rounded-lg"
						from={{ label: originName }}
						to={{ label: destinationName }}
						size="accessibility"
					/>
					<Button
						size="lg"
						onPress={onClose}
						accessible
						accessibilityRole="button"
					>
						<Text>Fechar</Text>
					</Button>
				</View>
			</FlowStep>
		</View>
	);
}
