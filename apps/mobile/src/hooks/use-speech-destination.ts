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
		error_not_available: "Reconhecimento de voz não disponível neste dispositivo.",
		error_no_service: "Serviço de reconhecimento de voz não encontrado. Verifique se o Google Assistente está instalado e ativo.",
		error_language_not_supported: "Idioma português não suportado neste dispositivo.",
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
	/**
	 * Permite o envio de áudio para servidores externos durante o
	 * reconhecimento de fala. Quando false, apenas reconhecimento
	 * local (no dispositivo) é utilizado.
	 * @default true
	 */
	voiceProcessingOnline?: boolean;
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
	voiceProcessingOnline = true,
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
	const isAvailableRef = useRef(false);
	const recognitionServiceRef = useRef<string | undefined>(undefined);
	const localeSupportedRef = useRef<boolean | null>(null);
	const fallbackAttemptedRef = useRef(false);

	// Recalcula os announces sempre que currentLocation mudar
	const ANNOUNCE = buildAnnouncements(currentLocation);

	// ─── Sondagem do dispositivo ao montar ────────────────────────────────────
	// Verifica se o dispositivo tem suporte a reconhecimento de voz, descobre
	// serviços disponíveis (Android) e checa se pt-BR é suportado.

	useEffect(() => {
		async function checkAvailability() {
			try {
				const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
				isAvailableRef.current = available;

				if (available && Platform.OS === "android") {
					// Descobre os serviços de reconhecimento instalados
					try {
						const services = ExpoSpeechRecognitionModule.getSpeechRecognitionServices();
						const preferred = [
							"com.google.android.as",
							"com.google.android.tts",
							"com.google.android.googlequicksearchbox",
						];
						for (const pkg of preferred) {
							if (services.includes(pkg)) {
								recognitionServiceRef.current = pkg;
								break;
							}
						}
						// Fallback: primeiro serviço disponível
						if (!recognitionServiceRef.current && services.length > 0) {
							recognitionServiceRef.current = services[0];
						}
					} catch { }

					// Fallback: serviço padrão do sistema
					if (!recognitionServiceRef.current) {
						try {
							const def = ExpoSpeechRecognitionModule.getDefaultRecognitionService();
							recognitionServiceRef.current = def.packageName;
						} catch { }
					}

					// Verifica se o idioma pt-BR está entre os suportados
					try {
						const locales = await ExpoSpeechRecognitionModule.getSupportedLocales({
							androidRecognitionServicePackage:
								recognitionServiceRef.current ?? "com.google.android.as",
						});
						localeSupportedRef.current =
							locales.locales.includes("pt-BR") ||
							locales.installedLocales.includes("pt-BR");
					} catch {
						// getSupportedLocales não funciona no Android 12 e inferior
						localeSupportedRef.current = null;
					}
				}
			} catch (e) {
				console.warn(
					"Falha ao verificar disponibilidade de reconhecimento de voz:",
					e,
				);
				isAvailableRef.current = false;
			}
		}
		checkAvailability();
	}, []);

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

		// ── Tentativa de fallback: local → online ───────────────────────────────
		// Se o reconhecimento local falhou (serviço não encontrado ou idioma não
		// suportado localmente) e o usuário permite processamento online, tenta
		// novamente sem a restrição de dispositivo local.
		if (
			voiceProcessingOnline &&
			Platform.OS === "android" &&
			!fallbackAttemptedRef.current &&
			(event.error === "service-not-allowed" ||
				event.error === "language-not-supported")
		) {
			fallbackAttemptedRef.current = true;
			announce("Reconhecimento local indisponível. Tentando servidor externo.");

			ExpoSpeechRecognitionModule.start({
				lang: "pt-BR",
				interimResults: true,
				continuous: false,
				volumeChangeEventOptions: { enabled: true },
				androidRecognitionServicePackage:
					recognitionServiceRef.current ?? "com.google.android.as",
			});
			return;
		}

		let displayError: string;
		let announceMsg: string;

		if (event.error === "not-allowed") {
			displayError =
				"Permissão do microfone negada. Permita o acesso nas configurações do navegador e tente novamente.";
			announceMsg = ANNOUNCE.error_permission;
		} else if (event.error === "service-not-allowed") {
			displayError =
				"O serviço de reconhecimento de voz não está disponível ou foi desativado. " +
				"Verifique se o Google Assistente ou serviço similar está ativo nas configurações do sistema.";
			announceMsg = ANNOUNCE.error_no_service;
		} else if (event.error === "language-not-supported") {
			displayError =
				"O idioma português (Brasil) não é suportado pelo serviço de reconhecimento de voz deste dispositivo.";
			announceMsg = ANNOUNCE.error_language_not_supported;
		} else if (event.error === "no-speech") {
			displayError =
				"Nenhuma fala detectada. Toque no microfone e fale claramente.";
			announceMsg =
				"Nenhuma fala detectada. Toque no microfone e fale claramente.";
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

		// Limpa estado de erro anterior antes de uma nova tentativa
		setPhase("idle");
		setResult((prev) => ({ ...prev, error: null, confidence: null }));

		// ── Verificação genérica de disponibilidade ───────────────────────────────
		// Tanto isRecognitionAvailable() quanto as verificações específicas
		// abaixo atuam em conjunto para evitar tentativas frustradas do usuário.
		if (!isAvailableRef.current) {
			try {
				isAvailableRef.current =
					ExpoSpeechRecognitionModule.isRecognitionAvailable();
			} catch {
				// Se a própria chamada lançar erro, assume indisponível
			}
		}

		if (!isAvailableRef.current) {
			const msg =
				Platform.OS === "android"
					? "Reconhecimento de voz não está disponível neste dispositivo. " +
					"Verifique se o Google Assistente está instalado e ativo em " +
					"Ajustes > Google > Configurações do Google Assistente > Voz e áudio."
					: Platform.OS === "ios"
						? "Reconhecimento de voz não está disponível. " +
						"Ative o Siri e Ditado em Ajustes > Acessibilidade > Conteúdo falado."
						: "Reconhecimento de voz não está disponível neste navegador. Tente usar Chrome ou Edge.";
			setPhase("error");
			setResult((prev) => ({ ...prev, error: msg }));
			announce(ANNOUNCE.error_not_available);
			return;
		}

		// ── Android: verificação adicional de suporte de idioma ──────────────────
		if (Platform.OS === "android" && localeSupportedRef.current === false) {
			setPhase("error");
			setResult((prev) => ({
				...prev,
				error:
					"O idioma português (Brasil) não está disponível para reconhecimento de voz " +
					"neste dispositivo. Verifique se o pacote de idiomas está instalado em " +
					"Ajustes > Sistema > Idiomas e entrada de texto > Assistente de voz.",
			}));
			announce(ANNOUNCE.error_language_not_supported);
			return;
		}

		// ── Web: verificação específica do Web Speech API ────────────────────────
		// O módulo web do expo-speech-recognition acessa `SpeechRecognition` sem
		// guarda typeof, causando "ReferenceError: SpeechRecognition is not defined"
		// em navegadores sem suporte (ex.: Firefox).
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

		// ── Android: reconhecimento local primeiro, online como fallback ──────
		// A estratégia é: sempre tentar o motor local (on-device). Se falhar por
		// indisponibilidade do serviço local ou falta de pacote de idioma, e o
		// usuário autorizou processamento online, o error handler faz uma segunda
		// tentativa sem a restrição local (fallback para nuvem).
		fallbackAttemptedRef.current = false;

		const nativeOptions: Record<string, unknown> = {};

		if (Platform.OS === "android") {
			// Quando o usuário permite online, tentamos local primeiro.
			// Quando não permite, forçamos local e não há fallback.
			nativeOptions.requiresOnDeviceRecognition = true;
			nativeOptions.androidRecognitionServicePackage =
				recognitionServiceRef.current ?? "com.google.android.as";
		}

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
