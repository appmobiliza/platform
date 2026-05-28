import {
  realtimeEnv,
  requireAblyEnv,
  requirePusherEnv,
  requireSupabaseEnv,
  requireWebSocketEnv,
} from '@mobiliza/env'

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
  const provider = realtimeEnv.REALTIME_PROVIDER as RealtimeProvider

  switch (provider) {
    case 'supabase': {
      const { url, anonKey } = requireSupabaseEnv()
      const { SupabaseRealtimeAdapter } = require('./adapters/server/supabase') as typeof import('./adapters/server/supabase')
      return new SupabaseRealtimeAdapter({ url, anonKey })
    }

    case 'websocket': {
      const { url } = requireWebSocketEnv()
      const { WebSocketRealtimeAdapter } = require('./adapters/server/websocket') as typeof import('./adapters/server/websocket')
      return new WebSocketRealtimeAdapter({ url })
    }

    case 'ably': {
      const { apiKey } = requireAblyEnv()
      const { AblyRealtimeAdapter } = require('./adapters/server/ably') as typeof import('./adapters/server/ably')
      return new AblyRealtimeAdapter({ apiKey })
    }

    case 'pusher': {
      const { PusherRealtimeAdapter } = require('./adapters/server/pusher') as typeof import('./adapters/server/pusher')
      return new PusherRealtimeAdapter(requirePusherEnv())
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

// ─── Re-exports ───────────────────────────────────────────────────────────────

export { AblyClientAdapter } from './adapters/client/ably'
export { MockClientAdapter } from './adapters/client/mock'
// Adaptadores client-side
export { SupabaseClientAdapter } from './adapters/client/supabase'
export { WebSocketClientAdapter } from './adapters/client/websocket'
// Adaptadores server-side (para uso avançado / testes)
export { MockRealtimeAdapter } from './adapters/server/mock'
export type { 
  AblyAdapterOptions,
  AblyClientAdapterOptions,
  PusherAdapterOptions,RealtimeAdapter, RealtimeClientAdapter, 
  RealtimePayload,RealtimeProvider, 
  SupabaseAdapterOptions,
  Unsubscribe,
  WebSocketAdapterOptions,} from './types'