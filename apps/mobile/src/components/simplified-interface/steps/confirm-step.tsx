import { View } from "react-native";

import { AddressRoute } from "@/components/address";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { FlowStep } from "./flow-step";
import type { StepBaseProps } from "./types";

// ─── Props ────────────────────────────────────────────────────────────────

export interface ConfirmStepProps extends StepBaseProps {
	originName: string;
	destinationName: string;
	onConfirm: () => void;
	onReject: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function ConfirmStep({
	style,
	originName,
	destinationName,
	onConfirm,
	onReject,
}: ConfirmStepProps) {
	return (
		<View className="flex-1" style={style}>
			<FlowStep
				subtitle="Confirma pra gente:"
				title={`Você deseja ir de ${originName} para ${destinationName}?`}
				note="Selecione 'Sim' para confirmar ou 'Não' para tentar novamente."
			>
				<View
					className="w-full gap-6 px-4"
					accessible
					accessibilityLabel={`Confirmação: de ${originName} para ${destinationName}`}
				>
					<AddressRoute
						className="bg-card border border-border p-4 rounded-lg gap-3"
						from={{ label: originName }}
						to={{ label: destinationName }}
						size="lg"
						shouldShowRoute
					/>

					<Button
						size="lg"
						className="h-16"
						onPress={onConfirm}
						accessible
						accessibilityRole="button"
						accessibilityLabel="Sim, quero enviar a solicitação"
						accessibilityHint="Confirma o deslocamento e envia a solicitação"
					>
						<Text className="text-2xl font-medium">
							Sim, quero enviar
						</Text>
					</Button>

					<Button
						size="lg"
						variant="destructive"
						className="h-16"
						onPress={onReject}
						accessible
						accessibilityRole="button"
						accessibilityLabel="Não, quero cancelar"
						accessibilityHint="Cancela e volta a ouvir o destino"
					>
						<Text className="text-2xl font-medium">
							Não, quero cancelar
						</Text>
					</Button>
				</View>
			</FlowStep>
		</View>
	);
}
