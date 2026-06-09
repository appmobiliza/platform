/**
 * Normaliza texto em pt-BR para comparação:
 * lowercase → remove acentos → colapsa espaços → remove stopwords opcionalmente
 */

const PT_BR_STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'ao', 'aos', 'a', 'e', 'ou', 'que', 'se', 'por', 'para', 'com',
  'ate', 'ate', 'mais', 'mas', 'ja', 'ainda', 'so', 'tambem',
])

export function normalize(text: string, removeStopwords = false): string {
  let result = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
    .replace(/[^a-z0-9\s]/g, ' ')   // remove pontuação
    .replace(/\s+/g, ' ')
    .trim()

  if (removeStopwords) {
    result = result
      .split(' ')
      .filter((w) => !PT_BR_STOPWORDS.has(w))
      .join(' ')
  }

  return result
}

/**
 * Distância de Levenshtein — sem dependência externa.
 * O(m×n), suficiente para strings de nomes de locais (~5–40 chars).
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[m][n]
}

/**
 * Score de similaridade entre 0 e 1.
 * 1 = idêntico, 0 = completamente diferente.
 */
export function similarityScore(a: string, b: string): number {
  const dist = levenshtein(a, b)
  return 1 - dist / Math.max(a.length, b.length, 1)
}
