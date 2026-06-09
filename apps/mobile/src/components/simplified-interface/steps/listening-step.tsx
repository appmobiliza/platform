import { useSpeechRecognitionEvent } from "expo-speech-recognition";
import { MicIcon, StopCircleIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

import type { SpeechPhase } from "@/types/location";

import { FlowStep } from "./flow-step";
import type { StepBaseProps } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────

const MIN_SCALE = 1;
const MAX_SCALE = 1.8;

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

	// ── Volume metering animation ──────────────────────────────────────────

	const volumeScale = useSharedValue(MIN_SCALE);
	const pulseScale = useSharedValue(MIN_SCALE);
	const pulseOpacity = useSharedValue(0);

	const resetAnimations = () => {
		volumeScale.value = MIN_SCALE;
		pulseScale.value = MIN_SCALE;
		pulseOpacity.value = 0;
	};

	useSpeechRecognitionEvent("start", resetAnimations);
	useSpeechRecognitionEvent("end", resetAnimations);

	useSpeechRecognitionEvent("volumechange", (event) => {
		// Don't animate if the volume is too low
		if (event.value <= 1) {
			return;
		}

		const newScale = interpolate(
			event.value,
			[-2, 10], // The value range is between -2 and 10
			[MIN_SCALE, MAX_SCALE],
			Extrapolation.CLAMP,
		);

		// Animate the volume scaling
		volumeScale.value = withSequence(
			withSpring(newScale, {
				damping: 10,
				stiffness: 150,
			}),
			// Scale back down, unless the volume changes again
			withTiming(MIN_SCALE, { duration: 500 }),
		);

		// Animate the pulse (scale and fade out)
		if (pulseOpacity.value <= 0) {
			pulseScale.value = MIN_SCALE;
			pulseOpacity.value = 1;
			pulseScale.value = withTiming(MAX_SCALE, {
				duration: 1000,
				easing: Easing.out(Easing.quad),
			});
			pulseOpacity.value = withTiming(0, { duration: 1000 });
		}
	});

	const volumeScaleStyle = useAnimatedStyle(() => ({
		transform: [{ scale: volumeScale.value }],
	}));

	const pulseStyle = useAnimatedStyle(() => ({
		opacity: pulseOpacity.value,
		transform: [{ scale: pulseScale.value }],
	}));

	// ── Render ─────────────────────────────────────────────────────────────

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
					{/* Microphone button with volume visualization */}
					<View
						className="relative items-center justify-center"
						style={{ width: 144, height: 144 }}
					>
						{/* Pulse ring */}
						<View className="absolute inset-0 justify-center items-center">
							<Animated.View
								style={[styles.pulseCircle, pulseStyle]}
							/>
						</View>
						{/* Volume intensity circle */}
						<View className="absolute inset-0 justify-center items-center">
							<Animated.View
								style={[styles.volumeCircle, volumeScaleStyle]}
							/>
						</View>
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
					</View>

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

					{/* Volume metering is enabled via `volumeChangeEventOptions`
					   in the `useSpeechDestination` hook. */}
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

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	volumeCircle: {
		width: 128,
		height: 128,
		borderRadius: 64,
		backgroundColor: "rgba(59, 130, 246, 0.12)",
	},
	pulseCircle: {
		width: 128,
		height: 128,
		borderRadius: 64,
		borderWidth: 2,
		borderColor: "#3b82f6",
	},
});
