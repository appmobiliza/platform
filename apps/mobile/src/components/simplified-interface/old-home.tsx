/**
 * Exemplo de uso do useSpeechDestination com origem automática por GPS.
 *
 * Fluxo:
 *  1. A tela resolve a localização atual via geofencing (hook externo)
 *  2. Estudante toca "Falar destino" e diz apenas para onde quer ir
 *  3. Hook preenche origem automaticamente com o local detectado pelo GPS
 *  4. Destino é extraído da fala via fuzzy match
 */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { useSpeechDestination } from "@/hooks/use-speech-destination";

import type { CampusLocation } from "@/types/location";

// ─── Locais de exemplo — viriam do seu store/DB local ────────────────────────

const CAMPUS_LOCATIONS: CampusLocation[] = [
	{
		id: "bib",
		name: "Biblioteca Central",
		abbreviations: ["BU", "Bib", "biblioteca"],
	},
	{ id: "reit", name: "Reitoria", abbreviations: ["reitoria"] },
	{ id: "bloco-a", name: "Bloco A", abbreviations: ["bloco a", "BA"] },
	{ id: "bloco-b", name: "Bloco B", abbreviations: ["bloco b", "BB"] },
	{
		id: "ru",
		name: "Restaurante Universitário",
		abbreviations: ["RU", "bandejão"],
	},
	{
		id: "nac",
		name: "NAC",
		abbreviations: ["nucleo de acessibilidade", "núcleo"],
	},
	{
		id: "ccen",
		name: "CCEN",
		abbreviations: ["centro de ciencias exatas", "exatas"],
	},
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface SpeechRequestFormProps {
	/**
	 * Local atual resolvido por geofencing/GPS.
	 * Quando null, o hook volta ao modo manual (usuário diz origem e destino).
	 */
	currentLocation: CampusLocation | null;
	/**
	 * Locais do campus disponíveis para reconhecimento de fala.
	 * Quando não fornecida, usa uma lista padrão com exemplos.
	 */
	locations?: CampusLocation[];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SpeechRequestForm({
	currentLocation,
	locations: propLocations,
}: SpeechRequestFormProps) {
	const activeLocations = propLocations ?? CAMPUS_LOCATIONS;

	const {
		phase,
		transcript,
		origin,
		destination,
		originSource,
		confidence,
		error,
		start,
		reset,
	} = useSpeechDestination({
		locations: activeLocations,
		currentLocation,
		onResult: ({ origin, destination }) => {
			console.log("Resultado:", { origin, destination });
		},
	});

	const isListening = phase === "listening";
	const isProcessing = phase === "processing";
	const isConfirmed = phase === "confirmed";

	return (
		<View style={styles.container}>
			{/* Origem automática — exibida antes mesmo de o usuário falar */}
			{currentLocation && (
				<View
					style={styles.originBanner}
					accessible
					accessibilityLabel={`Sua localização atual: ${currentLocation.name}`}
				>
					<Text style={styles.originBannerLabel}>Você está em</Text>
					<View style={styles.originBannerRow}>
						<Text style={styles.originBannerName}>
							{currentLocation.name}
						</Text>
						<View style={styles.gpsBadge} accessible={false}>
							<Text style={styles.gpsBadgeText}>GPS</Text>
						</View>
					</View>
				</View>
			)}

			{/* Botão principal de fala */}
			<Pressable
				style={[
					styles.micButton,
					isListening && styles.micButtonActive,
				]}
				onPress={isListening ? undefined : start}
				accessible
				accessibilityRole="button"
				accessibilityLabel={
					isListening
						? "Ouvindo. Aguarde ou toque para cancelar."
						: currentLocation
							? `Falar destino. Origem já definida: ${currentLocation.name}.`
							: "Falar destino. Toque para ditar origem e destino."
				}
				accessibilityState={{ busy: isListening || isProcessing }}
				accessibilityHint={
					currentLocation
						? "Diga apenas para onde quer ir."
						: "Diga de onde você está e para onde quer ir."
				}
			>
				<Text style={styles.micIcon}>{isListening ? "⏹" : "🎤"}</Text>
				<Text style={styles.micLabel}>
					{isListening
						? "Ouvindo..."
						: isProcessing
							? "Processando..."
							: "Falar destino"}
				</Text>
			</Pressable>

			{/* Transcrição em tempo real */}
			{transcript.length > 0 && (
				<View
					accessibilityLiveRegion="polite"
					accessibilityLabel={`Transcrição: ${transcript}`}
				>
					<Text style={styles.transcriptLabel}>Transcrição</Text>
					<Text style={styles.transcript}>{transcript}</Text>
				</View>
			)}

			{/* Resultado */}
			{isConfirmed && (
				<View style={styles.resultBlock}>
					{/* Origem */}
					<View style={styles.fieldRow}>
						<Text style={styles.fieldLabel}>Origem</Text>
						{origin ? (
							<View style={styles.fieldValueRow}>
								<Text
									style={styles.fieldValue}
									accessible
									accessibilityLabel={`Origem: ${origin.location.name}${originSource === "gps" ? ", detectada por GPS" : ""}`}
								>
									{origin.location.name}
								</Text>
								{originSource === "gps" && (
									<View
										style={styles.gpsBadge}
										accessible={false}
									>
										<Text style={styles.gpsBadgeText}>
											GPS
										</Text>
									</View>
								)}
							</View>
						) : (
							<Text style={styles.fieldMissing}>
								Não informada
							</Text>
						)}
					</View>

					{/* Destino */}
					<View style={styles.fieldRow}>
						<Text style={styles.fieldLabel}>Destino</Text>
						{destination ? (
							<Text
								style={styles.fieldValue}
								accessible
								accessibilityLabel={`Destino: ${destination.location.name}`}
							>
								{destination.location.name}
							</Text>
						) : (
							<Text style={styles.fieldMissing}>
								Não identificado
							</Text>
						)}
					</View>

					{/* Confiança — só exibe para destino reconhecido por voz */}
					{confidence && (
						<Text
							style={[
								styles.confidence,
								confidence === "high" && styles.confidenceHigh,
								confidence === "medium" &&
									styles.confidenceMedium,
								confidence === "low" && styles.confidenceLow,
							]}
							accessibilityLabel={`Confiança do reconhecimento: ${
								confidence === "high"
									? "alta"
									: confidence === "medium"
										? "média"
										: "baixa"
							}`}
						>
							{confidence === "high"
								? "✓ Reconhecido com alta confiança"
								: confidence === "medium"
									? "~ Confiança média — verifique os campos"
									: "✗ Baixa confiança — tente novamente"}
						</Text>
					)}

					<View style={styles.actions}>
						<Pressable
							style={styles.resetButton}
							onPress={reset}
							accessible
							accessibilityRole="button"
							accessibilityLabel="Tentar novamente"
						>
							<Text style={styles.resetLabel}>
								Tentar novamente
							</Text>
						</Pressable>
					</View>
				</View>
			)}

			{/* Erro */}
			{phase === "error" && (
				<Text
					style={styles.errorText}
					accessible
					accessibilityRole="alert"
					accessibilityLabel={`Erro: ${error ?? "tente novamente"}`}
				>
					{error ?? "Não foi possível reconhecer. Tente novamente."}
				</Text>
			)}
		</View>
	);
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	container: { gap: 16, padding: 20 },

	originBanner: {
		backgroundColor: "#E1F5EE",
		borderRadius: 10,
		padding: 14,
		gap: 2,
	},
	originBannerLabel: { fontSize: 12, color: "#0F6E56" },
	originBannerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
	originBannerName: {
		fontSize: 16,
		fontWeight: "500",
		color: "#085041",
		flex: 1,
	},

	gpsBadge: {
		backgroundColor: "#9FE1CB",
		borderRadius: 4,
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	gpsBadgeText: { fontSize: 11, fontWeight: "500", color: "#085041" },

	micButton: {
		minHeight: 72,
		backgroundColor: "#005E65",
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		flexDirection: "row",
		paddingHorizontal: 24,
	},
	micButtonActive: { backgroundColor: "#032F32" },
	micIcon: { fontSize: 24 },
	micLabel: { color: "#fff", fontSize: 18, fontWeight: "500" },

	transcriptLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
	transcript: { fontSize: 16, fontStyle: "italic", color: "#444" },

	resultBlock: { gap: 12 },
	fieldRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: "#e5e5e5",
	},
	fieldValueRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		flex: 1,
	},
	fieldLabel: { fontSize: 14, color: "#666", minWidth: 72 },
	fieldValue: { fontSize: 16, fontWeight: "500", color: "#111" },
	fieldMissing: { fontSize: 16, color: "#999", fontStyle: "italic" },

	confidence: { fontSize: 13, marginTop: 4 },
	confidenceHigh: { color: "#1D9E75" },
	confidenceMedium: { color: "#BA7517" },
	confidenceLow: { color: "#A32D2D" },

	actions: { flexDirection: "row", gap: 12, marginTop: 8 },
	resetButton: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ccc",
	},
	resetLabel: { fontSize: 15, color: "#333" },
	errorText: { color: "#A32D2D", fontSize: 15 },
});
