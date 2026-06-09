export interface CampusLocation {
	id: string
	name: string
	abbreviations?: string[] // ex: ["RU", "ICHCA"]
}

export interface ResolvedLocation {
	location: CampusLocation
	score: number    // 0–1, grau de confiança do match
	rawMatch: string // trecho da fala que originou o match
	/** 'gps' quando a origem foi resolvida automaticamente por geolocalização */
	source?: 'speech' | 'gps'
}

export type SpeechPhase =
	| 'idle'
	| 'listening'
	| 'processing'
	| 'confirmed'
	| 'error'

export interface SpeechDestinationResult {
	phase: SpeechPhase
	transcript: string          // texto bruto transcrito
	origin: ResolvedLocation | null
	destination: ResolvedLocation | null
	/** Como a origem foi resolvida. null enquanto não há resultado. */
	originSource: 'gps' | 'speech' | 'omitted' | null
	confidence: 'high' | 'medium' | 'low' | null
	error: string | null
	start: () => void
	stop: () => void
	reset: () => void
}
