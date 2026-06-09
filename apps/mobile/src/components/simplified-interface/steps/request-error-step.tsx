import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

import { FlowStep } from "./flow-step";
import type { StepBaseProps } from "./types";

// ─── Props ────────────────────────────────────────────────────────────────

export interface RequestErrorStepProps extends StepBaseProps {
	onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function RequestErrorStep({ style, onBack }: RequestErrorStepProps) {
	return (
		<View className="flex-1" style={style}>
			<FlowStep
				title="Erro ao criar solicitação"
				note="Não foi possível criar sua solicitação. Verifique sua conexão e tente novamente."
			>
				<Button
					size="lg"
					onPress={onBack}
					accessible
					accessibilityRole="button"
				>
					<Text>Voltar</Text>
				</Button>
			</FlowStep>
		</View>
	);
}
