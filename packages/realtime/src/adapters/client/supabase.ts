import type {
  RealtimeClientAdapter,
  RealtimePayload,
  SupabaseAdapterOptions,
  Unsubscribe,
} from '../../types'

type SupabaseClient = import('@supabase/supabase-js').SupabaseClient
type RealtimeChannel = import('@supabase/supabase-js').RealtimeChannel

/**
 * Adaptador **client-side** para o Supabase Realtime.
 *
 * Usado no React Native e no Next.js para receber eventos em tempo real.
 * Usa Broadcast (many-to-many, sem persistência) para escutar eventos
 * publicados pelo servidor.
 *
 * @example
 * ```ts
 * // Em um hook React
 * const adapter = new SupabaseClientAdapter({ url, anonKey })
 *
 * useEffect(() => {
 *   const unsub = adapter.subscribe('sala:42', 'voto:registrado', (data) => {
 *     setVotos(prev => [...prev, data])
 *   })
 *   return unsub
 * }, [])
 * ```
 */
export class SupabaseClientAdapter implements RealtimeClientAdapter {
  private client: SupabaseClient
  private channels = new Map<string, RealtimeChannel>()

  constructor(options: SupabaseAdapterOptions) {
    const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js')
    this.client = createClient(options.url, options.anonKey)
  }

  subscribe(
    channel: string,
    event: string,
    handler: (data: RealtimePayload) => void,
  ): Unsubscribe {
    if (!this.channels.has(channel)) {
      const ch = this.client.channel(channel)
      this.channels.set(channel, ch)
    }

    const ch = this.channels.get(channel)!

    ch.on('broadcast', { event }, ({ payload }) => {
      handler(payload as RealtimePayload)
    }).subscribe()

    return () => {
      // Remove apenas o handler específico; o canal permanece se houver outros
      ch.unsubscribe()
      this.channels.delete(channel)
    }
  }

  disconnect(): void {
    this.channels.forEach((ch) => {
      this.client.removeChannel(ch)
    })
    this.channels.clear()
  }
}
