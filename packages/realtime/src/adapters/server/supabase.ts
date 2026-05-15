import type {
  RealtimeAdapter,
  RealtimePayload,
  SupabaseAdapterOptions,
  Unsubscribe,
} from '../types'

// Importação lazy para não forçar a dependência em quem não usa Supabase
// O consumidor é responsável por instalar `@supabase/supabase-js`
type SupabaseClient = import('@supabase/supabase-js').SupabaseClient
type RealtimeChannel = import('@supabase/supabase-js').RealtimeChannel

/**
 * Adaptador server-side para o **Supabase Realtime**.
 *
 * Usa Broadcast para comunicação muitos-para-muitos — adequado para
 * eventos de sala de reunião (participantes, votações, presença).
 *
 * ## Variáveis de ambiente esperadas
 * ```
 * REALTIME_PROVIDER=supabase
 * SUPABASE_URL=https://xxxx.supabase.co
 * SUPABASE_ANON_KEY=eyJ...
 * ```
 *
 * @see https://supabase.com/docs/guides/realtime/broadcast
 */
export class SupabaseRealtimeAdapter implements RealtimeAdapter {
  private client: SupabaseClient
  private channels = new Map<string, RealtimeChannel>()

  constructor(options: SupabaseAdapterOptions) {
    // Importação dinâmica para não quebrar o bundle quando o Supabase não
    // está instalado (ex.: quem usa o adaptador WebSocket)
    const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js')
    this.client = createClient(options.url, options.anonKey, {
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    })
  }

  async publish(channel: string, event: string, data: RealtimePayload): Promise<void> {
    const ch = this.getOrCreateChannel(channel)

    await new Promise<void>((resolve, reject) => {
      ch.send({
        type: 'broadcast',
        event,
        payload: data,
      })

      // Supabase Broadcast é fire-and-forget no plano gratuito;
      // resolvemos imediatamente e logamos erros de forma não-bloqueante
      resolve()
    })
  }

  subscribe(channel: string, event: string, handler: (data: RealtimePayload) => void): Unsubscribe {
    const ch = this.getOrCreateChannel(channel)

    ch.on('broadcast', { event }, ({ payload }) => {
      handler(payload as RealtimePayload)
    })

    // Garante que o canal está inscrito
    ch.subscribe()

    return () => {
      // Não removemos o canal inteiro — pode haver outros listeners.
      // O canal é limpo em `unsubscribe(channel)`.
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    const ch = this.channels.get(channel)
    if (!ch) return

    await this.client.removeChannel(ch)
    this.channels.delete(channel)
  }

  async disconnect(): Promise<void> {
    await Promise.all(
      [...this.channels.values()].map((ch) => this.client.removeChannel(ch)),
    )
    this.channels.clear()
  }

  private getOrCreateChannel(channel: string): RealtimeChannel {
    if (!this.channels.has(channel)) {
      const ch = this.client.channel(channel, {
        config: { broadcast: { self: true } },
      })
      this.channels.set(channel, ch)
    }
    return this.channels.get(channel)!
  }
}
