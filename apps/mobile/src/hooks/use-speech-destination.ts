import {
	ExpoSpeechRecognitionModule,
	useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

import { extractEntities } from "@/utils/extract-entities";

import type {
	CampusLocation,
	SpeechDestinationResult,
	SpeechPhase,
} from "@/types/location";

// ─── Mensagens de feedback sonoro (pt-BR) ───────────────────────────────────

function buildAnnouncements(currentLocation?: CampusLocation | null) {
	return {
		listening: currentLocation
			? `Partindo de ${currentLocation.name}. Diga para onde quer ir.`
			: "Ouvindo. Diga de onde você está e para onde quer ir.",
		processing: "Processando sua solicitação.",
		confirmed_with_origin: (dest: string, origin: string) =>
			`Entendido. De ${origin} para ${dest}.`,
		confirmed_dest_only: (dest: string) =>
			`Destino identificado: ${dest}. Origem não informada.`,
		low_confidence:
			"Não entendi bem. Tente novamente falando mais devagar.",
		error_permission: "Permissão de microfone negada.",
		error_generic: "Erro ao reconhecer voz. Tente novamente.",
		error_browser: "O navegador não suporta o reconhecimento de voz. Tente usar o Google Chrome ou Microsoft Edge.",
		idle: "Reconhecimento encerrado.",
	};
}

function announce(msg: string) {
	AccessibilityInfo.announceForAccessibility(msg);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseSpeechDestinationOptions {
	locations: CampusLocation[];
	/**
	 * Localização atual do usuário resolvida por GPS/geofencing.
	 * Quando fornecida, a origem é preenchida automaticamente e o usuário
	 * só precisa dizer o destino.
	 */
	currentLocation?: CampusLocation | null;
	onResult?: (
		result: Pick<
			SpeechDestinationResult,
			"origin" | "destination" | "confidence"
		>,
	) => void;
}

export function useSpeechDestination({
	locations,
	currentLocation,
	onResult,
}: UseSpeechDestinationOptions): SpeechDestinationResult {
	const [phase, setPhase] = useState<SpeechPhase>("idle");
	const [transcript, setTranscript] = useState("");
	const [result, setResult] = useState<
		Omit<
			SpeechDestinationResult,
			"phase" | "transcript" | "start" | "stop" | "reset"
		>
	>({
		origin: null,
		destination: null,
		originSource: null,
		confidence: null,
		error: null,
	});

	const isListening = useRef(false);

	// Recalcula os announces sempre que currentLocation mudar
	const ANNOUNCE = buildAnnouncements(currentLocation);

	// ─── Eventos STT ───────────────────────────────────────────────────────────

	useSpeechRecognitionEvent("start", () => {
		isListening.current = true;
		setPhase("listening");
		announce(ANNOUNCE.listening);
	});

	useSpeechRecognitionEvent("end", () => {
		isListening.current = false;
		if (phase !== "confirmed" && phase !== "error") {
			setPhase("idle");
			announce(ANNOUNCE.idle);
		}
	});

	useSpeechRecognitionEvent("error", (event) => {
		isListening.current = false;

		let displayError: string;
		let announceMsg: string;

		if (event.error === "not-allowed") {
			displayError =
				"Permissão do microfone negada. Permita o acesso nas configurações do navegador e tente novamente.";
			announceMsg = ANNOUNCE.error_permission;
		} else if (Platform.OS === "web" && event.error === "network") {
			displayError =
				"Não foi possível conectar ao serviço de reconhecimento de voz. " +
				"Verifique sua conexão ou tente usar o Google Chrome.";
			announceMsg = ANNOUNCE.error_generic;
		} else {
			displayError =
				event.message || event.error || "Erro desconhecido ao reconhecer voz.";
			announceMsg = ANNOUNCE.error_generic;
		}

		console.log(event);
		setPhase("error");
		setResult((prev) => ({ ...prev, error: displayError }));
		announce(announceMsg);
	});

	/**
	 * Resultados intermediários: atualiza transcript para feedback visual
	 * em tempo real (útil para sinalizar que o sistema está ouvindo).
	 */
	useSpeechRecognitionEvent("result", (event) => {
		const text = event.results[0]?.transcript ?? "";
		setTranscript(text);

		// Só processa resultados finais para evitar NLU a cada palavra
		if (!event.isFinal) return;

		setPhase("processing");
		announce(ANNOUNCE.processing);

		const entities = extractEntities(text, locations);

		// ── Resolução de origem ──────────────────────────────────────────────────
		// Se currentLocation foi fornecida pelo GPS, ela tem prioridade absoluta
		// sobre qualquer coisa que o NLU tenha detectado na fala.
		const resolvedOrigin = currentLocation
			? {
				location: currentLocation,
				score: 1,
				rawMatch: "gps",
				source: "gps" as const,
			}
			: entities.origin
				? { ...entities.origin, source: "speech" as const }
				: null;

		const originSource = currentLocation
			? "gps"
			: entities.origin
				? "speech"
				: "omitted";

		const newResult = {
			origin: resolvedOrigin,
			destination: entities.destination,
			originSource,
			// Confiança aplica-se apenas ao destino quando origem vem do GPS
			confidence: currentLocation
				? entities.destination
					? entities.confidence // confiança do match do destino
					: "low"
				: entities.confidence,
			error: null,
		} as const;

		setResult(newResult);

		if (newResult.confidence === "low") {
			setPhase("error");
			announce(ANNOUNCE.low_confidence);
			return;
		}

		setPhase("confirmed");

		const destName = entities.destination?.location.name ?? "";
		const originName = resolvedOrigin?.location.name ?? "";

		announce(
			resolvedOrigin
				? ANNOUNCE.confirmed_with_origin(destName, originName)
				: ANNOUNCE.confirmed_dest_only(destName),
		);

		onResult?.({
			origin: resolvedOrigin,
			destination: entities.destination,
			confidence: newResult.confidence,
		});

		ExpoSpeechRecognitionModule.stop();
	});

	// ─── Controles ─────────────────────────────────────────────────────────────

	const start = useCallback(async () => {
		if (isListening.current) return;

		// Clear previous error state before a new attempt
		setPhase("idle");
		setResult((prev) => ({ ...prev, error: null, confidence: null }));

		// On web, check if the Web Speech API is available before proceeding.
		// The expo-speech-recognition web module has a bug where it accesses
		// `SpeechRecognition` without a typeof guard, crashing with
		// "ReferenceError: SpeechRecognition is not defined" in browsers
		// that don't support the Web Speech API (e.g. Firefox) or when the
		// API is otherwise unavailable.
		if (Platform.OS === "web") {
			const hasWebSpeech =
				typeof window !== "undefined" &&
				(typeof window.SpeechRecognition !== "undefined" ||
					typeof window.webkitSpeechRecognition !== "undefined");

			if (!hasWebSpeech) {
				setPhase("error");
				setResult((prev) => ({
					...prev,
					error:
						"Reconhecimento de fala não está disponível neste navegador. Tente usar Chrome ou Edge.",
				}));
				announce(ANNOUNCE.error_browser);
				return;
			}
		}

		const nativeOptions =
			Platform.OS !== "web"
				? {
					requiresOnDeviceRecognition: true,
					androidRecognitionServicePackage:
						"com.google.android.as",
				}
				: {};

		await ExpoSpeechRecognitionModule.requestPermissionsAsync();

		ExpoSpeechRecognitionModule.start({
			lang: "pt-BR",
			interimResults: true,
			continuous: false,
			volumeChangeEventOptions: { enabled: true },
			...nativeOptions,
		});
	}, []);

	const stop = useCallback(() => {
		ExpoSpeechRecognitionModule.stop();
		isListening.current = false;
		setPhase("idle");
	}, []);

	const reset = useCallback(() => {
		if (isListening.current) ExpoSpeechRecognitionModule.stop();
		isListening.current = false;
		setPhase("idle");
		setTranscript("");
		setResult({
			origin: null,
			destination: null,
			originSource: null,
			confidence: null,
			error: null,
		});
	}, []);

	// Garante cleanup ao desmontar
	useEffect(() => {
		return () => {
			if (isListening.current) ExpoSpeechRecognitionModule.stop();
		};
	}, []);

	return {
		phase,
		transcript,
		...result,
		start,
		stop,
		reset,
	};
}
