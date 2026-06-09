import { useRouter } from "expo-router";
import { Info, Timer } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSpeechDestination } from "@/hooks/use-speech-destination";
import { trpc } from "@/lib/trpc/client";

import type { CampusLocation, SpeechDestinationResult } from "@/types/location";

import { AddressRoute } from "../address";
import { SearchIndicator } from "../request-flow-sheet/subcomponents/seach-indicator";
import type { Place } from "../request-flow-sheet/types";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Text } from "../ui/text";

// ─── Types ────────────────────────────────────────────────────────────────

export interface AcessibleRequestStep {
	subtitle?: string;
	title: string;
	note: string | React.ReactNode;
	children: React.ReactNode;
}

interface AccessibleRequestFlowProps {
	campusLocations: Place[];
	nearestPoint: Place | null;
}

type FlowStage =
	| "listening"
	| "confirm"
	| "searching"
	| "unattended"
	| "request-error"
	| "scholar-found"
	| "in-transit";

// ─── Helpers ──────────────────────────────────────────────────────────────

function toCampusLocation(p: Place): CampusLocation {
	return {
		id: p.id ?? p.name,
		name: p.name,
		abbreviations: p.abbreviation ? [p.abbreviation] : undefined,
	};
}

// ─── FlowStep UI component ─────────────────────────────────────────────────

export function FlowStep({
	title,
	note,
	children,
	subtitle,
}: AcessibleRequestStep) {
	return (
		<View className="flex-1">
			<View className="bg-primary px-4 flex justify-start items-start">
				{subtitle && (
					<Text className="text-primary-foreground font-semibold text-lg mb-1">
						{subtitle}
					</Text>
				)}
				<Text
					className="text-primary-foreground text-4xl mb-4 font-extrabold"
					accessibilityRole="header"
				>
					{title}
				</Text>
				<View className="flex flex-row items-center justify-center mb-4 gap-3 w-full bg-background rounded-md p-4">
					<Icon icon={Info} color="white" size={20} />
					<Text className="text-primary-foreground text-base flex-1 leading-6">
						{note}
					</Text>
				</View>
			</View>
			{children}
		</View>
	);
}

// ─── Main accessible request flow component ───────────────────────────────

export function AccessibleRequestFlow({
	campusLocations,
	nearestPoint,
}: AccessibleRequestFlowProps) {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const [stage, setStage] = useState<FlowStage>("listening");
	const [origin, setOrigin] = useState<Place | null>(null);
	const [destination, setDestination] = useState<Place | null>(null);
	const [searchState, setSearchState] = useState<
		"idle" | "searching" | "unattended" | "error"
	>("idle");
	const [elapsedSeconds, setElapsedSeconds] = useState(0);

	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const hasStartedListening = useRef(false);

	// ─── Dependencies ────────────────────────────────────────────────────

	const createRequest = trpc.requests.create.useMutation();
	const utils = trpc.useContext();

	// Map Place[] → CampusLocation[] for the speech hook
	const campusLocationList = useMemo<CampusLocation[]>(
		() => campusLocations.map(toCampusLocation),
		[campusLocations],
	);

	// Quick lookup: Place name → Place (with lat/lng)
	const locationsByName = useMemo(
		() => new Map(campusLocations.map((p) => [p.name, p])),
		[campusLocations],
	);

	// Current location as CampusLocation for the speech hook
	const currentCampusLocation = useMemo<CampusLocation | null>(
		() => (nearestPoint ? toCampusLocation(nearestPoint) : null),
		[nearestPoint],
	);

	// ─── Speech hook ─────────────────────────────────────────────────────

	const handleSpeechResult = useCallback(
		(
			result: Pick<
				SpeechDestinationResult,
				"origin" | "destination" | "confidence"
			>,
		) => {
			if (!result.destination) return;

			const destPlace = locationsByName.get(
				result.destination.location.name,
			);
			if (destPlace) setDestination(destPlace);

			if (result.origin) {
				const origPlace = locationsByName.get(
					result.origin.location.name,
				);
				if (origPlace) setOrigin(origPlace);
			} else if (nearestPoint) {
				setOrigin(nearestPoint);
			}

			setStage("confirm");

			const destName = result.destination.location.name;
			const originName =
				result.origin?.location.name ??
				nearestPoint?.name ??
				"sua localização atual";
			AccessibilityInfo.announceForAccessibility(
				`Confirme o destino: de ${originName} para ${destName}. Toque em Sim para confirmar ou Não para tentar novamente.`,
			);
		},
		[locationsByName, nearestPoint],
	);

	const {
		phase,
		transcript,
		error: speechError,
		start,
		reset,
	} = useSpeechDestination({
		locations: campusLocationList,
		currentLocation: currentCampusLocation,
		onResult: handleSpeechResult,
	});

	// ─── Auto-start listening when stage becomes "listening" ──────────────

	const startListening = useCallback(() => {
		const t = setTimeout(() => start(), 300);
		return () => clearTimeout(t);
	}, [start]);

	useEffect(() => {
		if (stage === "listening" && !hasStartedListening.current) {
			hasStartedListening.current = true;
			return startListening();
		}
	}, [stage, startListening]);

	// ─── "Cancelar" voice command ────────────────────────────────────────

	useEffect(() => {
		if (
			stage === "listening" &&
			transcript.toLowerCase().includes("cancelar")
		) {
			reset();
			router.back();
		}
	}, [transcript, stage, reset, router]);

	// ─── Timer for searching stage ───────────────────────────────────────

	useEffect(() => {
		if (stage === "searching" && searchState === "searching") {
			timerRef.current = setInterval(() => {
				setElapsedSeconds((s) => s + 1);
			}, 1000);
			return () => {
				if (timerRef.current) clearInterval(timerRef.current);
			};
		}
	}, [stage, searchState]);

	// ─── Cleanup timer on unmount ────────────────────────────────────────

	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	// ─── Handlers ────────────────────────────────────────────────────────

	const handleConfirm = useCallback(async () => {
		if (!origin || !destination) return;

		setStage("searching");
		setSearchState("searching");
		setElapsedSeconds(0);

		AccessibilityInfo.announceForAccessibility(
			"Procurando contribuintes. Aguarde.",
		);

		try {
			const locations = await utils.locations.list.fetch();
			const map = new Map(locations.map((l) => [l.name, l.id]));
			const originId = map.get(origin.name);
			const destinationId = map.get(destination.name);

			if (!originId || !destinationId) {
				setSearchState("error");
				return;
			}

			const result = await createRequest.mutateAsync({
				originLocationId: originId,
				destinationLocationId: destinationId,
			});

			if (result.id) {
				// TODO: Subscribe to real-time events when realtime infra is integrated
				// For now, we stay on the searching screen.
			}
		} catch {
			setSearchState("error");
		}
	}, [origin, destination, createRequest, utils]);

	const handleReject = useCallback(() => {
		reset();
		setOrigin(null);
		setDestination(null);
		hasStartedListening.current = false;
		setStage("listening");
		AccessibilityInfo.announceForAccessibility(
			"Vamos tentar novamente. Diga para onde deseja ir.",
		);
	}, [reset]);

	const handleBack = useCallback(() => {
		reset();
		router.back();
	}, [reset, router]);

	const handleRetry = useCallback(() => {
		hasStartedListening.current = false;
		setStage("listening");
		AccessibilityInfo.announceForAccessibility(
			"Toque no microfone e diga para onde deseja ir.",
		);
	}, []);

	// ─── Render — outer scroll wrapper with insets ───────────────────────

	const outerPadding = { paddingTop: insets.top + 64 };

	// ── Stage: listening ─────────────────────────────────────────────────
	if (stage === "listening") {
		const isListening = phase === "listening";
		const isProcessing = phase === "processing";
		const hasError = phase === "error";

		return (
			<View style={outerPadding}>
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
					<View className="items-center gap-6 w-full px-4">
						{/* Microphone button */}
						<Button
							size="lg"
							className={`w-28 h-28 rounded-full ${isListening ? "bg-destructive" : "bg-primary"}`}
							onPress={
								isListening || hasError ? handleRetry : start
							}
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
								{isListening ? "⏹" : "🎤"}
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
							onPress={handleBack}
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

	// ── Stage: confirm ──────────────────────────────────────────────────
	if (stage === "confirm") {
		const originName =
			origin?.abbreviation ?? origin?.name ?? "sua localização atual";
		const destinationName = destination?.name ?? "";

		return (
			<View style={outerPadding}>
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
							className="bg-card border border-border p-4 rounded-lg"
							from={{ label: originName }}
							to={{ label: destinationName }}
							size="lg"
						/>

						<Button
							size="lg"
							className="py-6"
							onPress={handleConfirm}
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
							className="py-6"
							onPress={handleReject}
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

	// ── Stage: searching / unattended / request-error ───────────────────

	const originName = origin?.abbreviation ?? origin?.name ?? "";
	const destinationName = destination?.name ?? "";

	// Unattended (no scholar found)
	if (searchState === "unattended") {
		return (
			<View style={outerPadding}>
				<FlowStep
					title="Nenhum contribuinte encontrado"
					note="Nenhum contribuinte aceitou sua solicitação no tempo esperado. Tente novamente mais tarde ou entre em contato com o NAC."
				>
					<View className="w-full gap-4 px-4">
						<AddressRoute
							className="bg-card border border-border p-4 rounded-lg"
							from={{ label: originName }}
							to={{ label: destinationName }}
						/>
						<Button
							size="lg"
							onPress={handleBack}
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

	// Request creation error
	if (searchState === "error") {
		return (
			<View style={outerPadding}>
				<FlowStep
					title="Erro ao criar solicitação"
					note="Não foi possível criar sua solicitação. Verifique sua conexão e tente novamente."
				>
					<Button
						size="lg"
						onPress={handleBack}
						accessible
						accessibilityRole="button"
					>
						<Text>Voltar</Text>
					</Button>
				</FlowStep>
			</View>
		);
	}

	// Actively searching
	return (
		<View style={outerPadding}>
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
						className="bg-card border border-border p-4 rounded-lg"
						from={{ label: originName }}
						to={{ label: destinationName }}
					/>

					<Button
						variant="destructive"
						size="lg"
						className="py-6"
						onPress={handleBack}
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
