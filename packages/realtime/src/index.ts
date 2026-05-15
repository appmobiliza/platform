import type { RealtimeAdapter, RealtimeProvider } from './types'

/**
 * Cria e retorna o adaptador **server-side** configurado por variável
 * de ambiente `REALTIME_PROVIDER`.
 *
 * Apenas o adaptador selecionado é importado — os demais não são
 * carregados no bundle, o que evita dependências transitivas desnecessárias.
 *
 * ## Configuração
 *
 * Defina `REALTIME_PROVIDER` no `.env` do servidor:
 *
 * | Provider     | Valor         | Variáveis adicionais                          |
 * |--------------|---------------|-----------------------------------------------|
 * | Supabase     | `supabase`    | `SUPABASE_URL`, `SUPABASE_ANON_KEY`           |
 * | WebSocket    | `websocket`   | `WS_URL` (ex.: `ws://0.0.0.0:4001`)          |
 * | Ably         | `ably`        | `ABLY_API_KEY`                                |
 * | Pusher       | `pusher`      | `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER` |
 * | Mock (testes)| `mock`        | —                                             |
 *
 * @example
 * ```ts
 * // No bootstrap do servidor (ex.: src/server.ts)
 * import { createRealtimeAdapter } from '@mobiliza/realtime'
 *
 * const realtime = createRealtimeAdapter()
 * await realtime.publish('sala:42', 'voto:registrado', { userId: 'abc', valor: 5 })
 * ```
 */
export function createRealtimeAdapter(): RealtimeAdapter {
  const provider = (process.env.REALTIME_PROVIDER ?? 'supabase') as RealtimeProvider

  switch (provider) {
    case 'supabase': {
      const url = requireEnv('SUPABASE_URL')
      const anonKey = requireEnv('SUPABASE_ANON_KEY')
      const { SupabaseRealtimeAdapter } = require('./adapters/server/supabase') as typeof import('./adapters/server/supabase')
      return new SupabaseRealtimeAdapter({ url, anonKey })
    }

    case 'websocket': {
      const url = requireEnv('WS_URL')
      const { WebSocketRealtimeAdapter } = require('./adapters/server/websocket') as typeof import('./adapters/server/websocket')
      return new WebSocketRealtimeAdapter({ url })
    }

    case 'ably': {
      const apiKey = requireEnv('ABLY_API_KEY')
      const { AblyRealtimeAdapter } = require('./adapters/server/ably') as typeof import('./adapters/server/ably')
      return new AblyRealtimeAdapter({ apiKey })
    }

    case 'pusher': {
      const { PusherRealtimeAdapter } = require('./adapters/server/pusher') as typeof import('./adapters/server/pusher')
      return new PusherRealtimeAdapter({
        appId: requireEnv('PUSHER_APP_ID'),
        key: requireEnv('PUSHER_KEY'),
        secret: requireEnv('PUSHER_SECRET'),
        cluster: requireEnv('PUSHER_CLUSTER'),
      })
    }

    case 'mock': {
      const { MockRealtimeAdapter } = require('./adapters/server/mock') as typeof import('./adapters/server/mock')
      return new MockRealtimeAdapter()
    }

    default: {
      const _exhaustive: never = provider
      throw new Error(
        `[realtime] Provider desconhecido: "${_exhaustive}". ` +
          `Valores aceitos: supabase | websocket | ably | pusher | mock`,
      )
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `[realtime] Variável de ambiente obrigatória não definida: ${key}\n` +
        `Verifique o arquivo .env do pacote de API.`,
    )
  }
  return value
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { RealtimeAdapter, RealtimeClientAdapter, RealtimeProvider } from './types'
export type {
  SupabaseAdapterOptions,
  AblyAdapterOptions,
  WebSocketAdapterOptions,
  PusherAdapterOptions,
  RealtimePayload,
  Unsubscribe,
} from './types'

// Adaptadores server-side (para uso avançado / testes)
export { MockRealtimeAdapter } from './adapters/server/mock'

// Adaptadores client-side
export { SupabaseClientAdapter } from './adapters/client/supabase'
export { WebSocketClientAdapter } from './adapters/client/websocket'
export { MockClientAdapter } from './adapters/client/mock'
