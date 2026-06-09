import { Timer } from "lucide-react-native";
import { View } from "react-native";

import { AddressRoute } from "@/components/address";
import { SearchIndicator } from "@/components/request-flow-sheet/subcomponents/seach-indicator";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import { FlowStep } from "./flow-step";
import type { StepBaseProps } from "./types";

// ─── Props ────────────────────────────────────────────────────────────────

export interface SearchingStepProps extends StepBaseProps {
	elapsedSeconds: number;
	originName: string;
	destinationName: string;
	onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function SearchingStep({
	style,
	elapsedSeconds,
	originName,
	destinationName,
	onCancel,
}: SearchingStepProps) {
	return (
		<View className="flex-1" style={style}>
			<FlowStep
				subtitle="Por favor, aguarde"
				title="Procurando contribuintes..."
				note="Para voltar à página inicial, selecione o botão 'cancelar solicitação' abaixo"
			>
				<View
					className="items-center gap-4 w-full px-4"
					accessibilityLabel="Procurando contribuintes. Aguarde."
					accessibilityLiveRegion="polite"
				>
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

					<AddressRoute
						className="bg-card border border-border p-4 rounded-lg gap-3"
						from={{ label: originName }}
						to={{ label: destinationName }}
						shouldShowRoute
					/>

					<Button
						variant="destructive"
						size="lg"
						className="h-16"
						onPress={onCancel}
						accessible
						accessibilityRole="button"
						accessibilityLabel="Cancelar solicitação"
					>
						<Text className="text-xl">Cancelar solicitação</Text>
					</Button>
				</View>
			</FlowStep>
		</View>
	);
}
