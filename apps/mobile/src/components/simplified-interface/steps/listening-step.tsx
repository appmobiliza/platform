import { MicIcon, StopCircleIcon } from "lucide-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import type { SpeechPhase } from "@/types/location";

import { FlowStep } from "./flow-step";
import type { StepBaseProps } from "./types";

// ─── Props ────────────────────────────────────────────────────────────────

export interface ListeningStepProps extends StepBaseProps {
	phase: SpeechPhase;
	transcript: string;
	speechError: string | null;
	start: () => void;
	onRetry: () => void;
	onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function ListeningStep({
	style,
	phase,
	transcript,
	speechError,
	start,
	onRetry,
	onBack,
}: ListeningStepProps) {
	const isListening = phase === "listening";
	const isProcessing = phase === "processing";
	const hasError = phase === "error";

	return (
		<View className="flex-1">
			<FlowStep
				subtitle="Estamos ouvindo seu pedido"
				title="Diga para onde deseja ir"
				note={
					hasError
						? "Não entendi. Toque no microfone para tentar novamente."
						: isProcessing
							? "Processando sua solicitação..."
							: "Fale claramente o nome do local para onde deseja ir."
				}
			>
				<View className="items-center gap-6 flex-1 justify-center px-4">
					{/* Microphone button */}
					<Button
						size="lg"
						className={`w-28 h-28 rounded-full ${isListening ? "bg-destructive" : "bg-primary"}`}
						onPress={isListening || hasError ? onRetry : start}
						accessible
						accessibilityRole="button"
						accessibilityLabel={
							isListening
								? "Ouvindo. Toque para parar e tentar novamente."
								: hasError
									? "Toque para tentar novamente."
									: "Toque para começar a falar o destino"
						}
						accessibilityState={{
							busy: isListening || isProcessing,
						}}
					>
						<Text className="text-4xl" accessible={false}>
							{isListening ? (
								<Icon
									icon={StopCircleIcon}
									size={48}
									color={"white"}
								/>
							) : (
								<Icon
									icon={MicIcon}
									size={48}
									color={"white"}
								/>
							)}
						</Text>
					</Button>

					{/* Real-time transcription */}
					{transcript.length > 0 && (
						<View
							className="bg-card border border-border rounded-lg p-4 w-full"
							accessible
							accessibilityLabel={`Transcrição: ${transcript}`}
							accessibilityLiveRegion="polite"
						>
							<Text className="text-sm font-semibold text-muted-foreground mb-1">
								Transcrição
							</Text>
							<Text className="text-base text-foreground">
								{transcript}
							</Text>
						</View>
					)}

					{/* Error message */}
					{hasError && speechError && (
						<Text
							className="text-destructive-foreground bg-destructive p-3 rounded-lg"
							accessibilityRole="alert"
						>
							{speechError}
						</Text>
					)}

					{/* Back button */}
					<Button
						variant="outline"
						className="mt-2"
						onPress={onBack}
						accessible
						accessibilityRole="button"
						accessibilityLabel="Voltar para a página inicial"
					>
						<Text>Cancelar</Text>
					</Button>
				</View>
			</FlowStep>
		</View>
	);
}
