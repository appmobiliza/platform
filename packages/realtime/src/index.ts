import {
  realtimeEnv,
  requireAblyEnv,
  requirePusherEnv,
  requireSupabaseEnv,
  requireWebSocketEnv,
} from '@mobiliza/env'

import type { RealtimeAdapter, RealtimeProvider } from './types'

/**
 * Cria e retorna o adaptador server-side configurado por
 * `REALTIME_PROVIDER`.
 *
 * Apenas o provider selecionado é carregado dinamicamente,
 * evitando dependências desnecessárias no bundle.
 */
export async function createRealtimeAdapter(): Promise<RealtimeAdapter> {
  const provider = realtimeEnv.REALTIME_PROVIDER as RealtimeProvider

  switch (provider) {
    case 'supabase': {
      const { url, anonKey } = requireSupabaseEnv()

      const { SupabaseRealtimeAdapter } = await import(
        './adapters/server/supabase'
      )

      return new SupabaseRealtimeAdapter({
        url,
        anonKey,
      })
    }

    case 'websocket': {
      const { url } = requireWebSocketEnv()

      const { WebSocketRealtimeAdapter } = await import(
        './adapters/server/websocket'
      )

      return new WebSocketRealtimeAdapter({
        url,
      })
    }

    case 'ably': {
      const { apiKey } = requireAblyEnv()

      const { AblyRealtimeAdapter } = await import(
        './adapters/server/ably'
      )

      return await AblyRealtimeAdapter.create({
        apiKey,
      })
    }

    case 'pusher': {
      const { PusherRealtimeAdapter } = await import(
        './adapters/server/pusher'
      )

      return new PusherRealtimeAdapter(requirePusherEnv())
    }

    case 'mock': {
      const { MockRealtimeAdapter } = await import(
        './adapters/server/mock'
      )

      return new MockRealtimeAdapter()
    }

    default: {
      const exhaustive: never = provider

      throw new Error(
        `[realtime] Provider desconhecido: "${exhaustive}". ` +
          'Valores aceitos: supabase | websocket | ably | pusher | mock',
      )
    }
  }
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

// Client-side adapters
export { AblyClientAdapter } from './adapters/client/ably'
export { MockClientAdapter } from './adapters/client/mock'
export { SupabaseClientAdapter } from './adapters/client/supabase'
export { WebSocketClientAdapter } from './adapters/client/websocket'
// Server-side adapters
export { MockRealtimeAdapter } from './adapters/server/mock'
// Types
export type {
  AblyAdapterOptions,
  AblyClientAdapterOptions,
  PusherAdapterOptions,
  RealtimeAdapter,
  RealtimeClientAdapter,
  RealtimePayload,
  RealtimeProvider,
  SupabaseAdapterOptions,
  Unsubscribe,
  WebSocketAdapterOptions,
} from './types'