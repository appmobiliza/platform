import type {
  RealtimeAdapter,
  RealtimePayload,
  AblyAdapterOptions,
  Unsubscribe,
} from '../types'

// `ably` é instalado apenas quando REALTIME_PROVIDER=ably
type AblyRealtime = import('ably').Realtime
type AblyChannel = import('ably').RealtimeChannel

/**
 * Adaptador server-side para **Ably Realtime**.
 *
 * Ably é uma alternativa robusta ao Supabase com garantias de entrega
 * (at-least-once) e presença nativa — ideal se o projeto crescer além
 * do free tier do Supabase.
 *
 * ## Variáveis de ambiente esperadas
 * ```
 * REALTIME_PROVIDER=ably
 * ABLY_API_KEY=xVLyHw.xxxxxxxx:yyyyyy
 * ```
 *
 * @see https://ably.com/docs/getting-started/setup
 */
export class AblyRealtimeAdapter implements RealtimeAdapter {
  private client: AblyRealtime
  private channels = new Map<string, AblyChannel>()

  constructor(options: AblyAdapterOptions) {
    const Ably = require('ably') as typeof import('ably')
    this.client = new Ably.Realtime({
      key: options.apiKey,
      environment: options.environment,
    })
  }

  async publish(channel: string, event: string, data: RealtimePayload): Promise<void> {
    const ch = this.getOrCreateChannel(channel)

    await new Promise<void>((resolve, reject) => {
      ch.publish(event, data, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  subscribe(channel: string, event: string, handler: (data: RealtimePayload) => void): Unsubscribe {
    const ch = this.getOrCreateChannel(channel)

    const ablyHandler = (message: { data: RealtimePayload }) => {
      handler(message.data)
    }

    ch.subscribe(event, ablyHandler)

    return () => {
      ch.unsubscribe(event, ablyHandler)
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    const ch = this.channels.get(channel)
    if (!ch) return

    ch.unsubscribe()
    ch.detach()
    this.channels.delete(channel)
  }

  async disconnect(): Promise<void> {
    await Promise.all(
      [...this.channels.keys()].map((ch) => this.unsubscribe(ch)),
    )
    this.client.close()
  }

  private getOrCreateChannel(channel: string): AblyChannel {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, this.client.channels.get(channel))
    }
    return this.channels.get(channel)!
  }
}
