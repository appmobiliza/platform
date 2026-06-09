import type { CampusLocation, ResolvedLocation } from '../types/location'
import { normalize, similarityScore } from './normalize'

// ─── Padrões de captura pt-BR ────────────────────────────────────────────────

/**
 * Padrões de ORIGEM (de onde o estudante está partindo).
 * Cada regex retorna o grupo 1 como candidato textual.
 * Ordenados do mais específico para o mais genérico.
 */
const ORIGIN_PATTERNS: RegExp[] = [
	/(?:saindo?\s+d[aoe]?s?\s+|estou\s+n[ao]?\s+|venho\s+d[aoe]?s?\s+|partindo\s+d[aoe]?s?\s+|vim\s+d[aoe]?s?\s+)(.+?)(?:\s+(?:para|pro|pra|ate|em\s+direcao|quero\s+ir)|$)/i,
	/(?:^|\s)d[aoe]?s?\s+(.+?)\s+(?:para|pro|pra|ate|em\s+direcao)/i,
]

/**
 * Padrões de DESTINO (para onde o estudante quer ir).
 */
const DESTINATION_PATTERNS: RegExp[] = [
	/(?:quero\s+ir\s+(?:para|pro|pra|ate)\s+|me\s+leva\s+(?:para|pro|pra|ate)\s+|preciso\s+ir\s+(?:para|pro|pra|ate)\s+|vou\s+(?:para|pro|pra|ate)\s+)(.+)/i,
	/(?:para|pro|pra|ate|em\s+direcao\s+ao?)\s+(?:o\s+|a\s+|os\s+|as\s+)?(.+)/i,
	/^(.+)$/i, // fallback: tudo é destino se não houver padrão de origem
]

// ─── Fuzzy matcher ───────────────────────────────────────────────────────────

const MATCH_THRESHOLD = 0.55 // score mínimo para aceitar um match

/**
 * Dado um fragmento de texto e a lista de locais, retorna o melhor match.
 * Compara contra: nome completo, nome normalizado, abreviações.
 */
function matchLocation(
	fragment: string,
	locations: CampusLocation[]
): ResolvedLocation | null {
	const normFragment = normalize(fragment, true) // sem stopwords
	const fragTokens = normFragment.split(' ').filter(Boolean)

	let best: ResolvedLocation | null = null

	for (const loc of locations) {
		const candidates = [
			normalize(loc.name),
			normalize(loc.name, true),
			...(loc.abbreviations ?? []).map((a) => normalize(a)),
		]

		let locBest = 0

		for (const candidate of candidates) {
			// 1. Match exato do fragmento completo
			const full = similarityScore(normFragment, candidate)
			locBest = Math.max(locBest, full)

			// 2. Match parcial: algum token do fragmento bate bem com o candidato
			for (const token of fragTokens) {
				if (token.length < 3) continue // ignora tokens muito curtos
				const partial = similarityScore(token, candidate)
				// boost se o candidato *começa* com o token (ex: "bloco" → "bloco b")
				const startBoost = candidate.startsWith(token) ? 0.1 : 0
				locBest = Math.max(locBest, partial + startBoost)
			}

			// 3. Match de substrings: fragmento contém o candidato ou vice-versa
			if (normFragment.includes(candidate) || candidate.includes(normFragment)) {
				locBest = Math.max(locBest, 0.9)
			}
		}

		if (locBest >= MATCH_THRESHOLD) {
			if (!best || locBest > best.score) {
				best = { location: loc, score: Math.min(locBest, 1), rawMatch: fragment }
			}
		}
	}

	return best
}

// ─── Extrator principal ──────────────────────────────────────────────────────

export interface ExtractedEntities {
	origin: ResolvedLocation | null
	destination: ResolvedLocation | null
	originOmitted: boolean
	confidence: 'high' | 'medium' | 'low'
}

export function extractEntities(
	transcript: string,
	locations: CampusLocation[]
): ExtractedEntities {
	const text = normalize(transcript)

	let originFragment: string | null = null
	let destinationFragment: string | null = null

	// Tenta capturar origem
	for (const pattern of ORIGIN_PATTERNS) {
		const match = text.match(pattern)
		if (match?.[1]) {
			originFragment = match[1].trim()
			break
		}
	}

	// Tenta capturar destino
	for (const pattern of DESTINATION_PATTERNS) {
		const match = text.match(pattern)
		if (match?.[1]) {
			// Evita re-capturar o fragmento de origem como destino
			const candidate = match[1].trim()
			if (!originFragment || !candidate.includes(originFragment)) {
				destinationFragment = candidate
				break
			}
		}
	}

	const origin = originFragment ? matchLocation(originFragment, locations) : null
	const destination = destinationFragment
		? matchLocation(destinationFragment, locations)
		: null

	// Calcula confiança geral
	const scores = [origin?.score, destination?.score].filter(
		(s): s is number => s !== undefined
	)
	const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

	const confidence: 'high' | 'medium' | 'low' =
		avgScore >= 0.85 ? 'high' : avgScore >= 0.65 ? 'medium' : 'low'

	return {
		origin,
		destination,
		originOmitted: originFragment === null,
		confidence,
	}
}
