import type {
  RealtimeAdapter,
  RealtimePayload,
  AblyAdapterOptions,
  Unsubscribe,
} from '../../types'

// `ably` é instalado apenas quando REALTIME_PROVIDER=ably
import type { Realtime as AblyRealtime, RealtimeChannel as AblyChannel, messageCallback, InboundMessage } from 'ably'

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

    await ch.publish(event, data)
  }

  subscribe(channel: string, event: string, handler: (data: RealtimePayload) => void): Unsubscribe {
    const ch = this.getOrCreateChannel(channel)

    const ablyHandler: messageCallback<InboundMessage> = (message) => {
      if (message.data !== undefined) {
        handler(message.data as RealtimePayload)
      }
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
      const ch = this.client.channels.get(channel)
      this.channels.set(channel, ch)
      return ch
    }
    return this.channels.get(channel)!
  }
}
