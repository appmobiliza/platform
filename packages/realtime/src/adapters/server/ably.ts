import type {
  InboundMessage,
  messageCallback,
  Realtime,
  RealtimeChannel,
} from 'ably'

import type {
  AblyAdapterOptions,
  RealtimeAdapter,
  RealtimePayload,
  Unsubscribe,
} from '../../types'

export class AblyRealtimeAdapter implements RealtimeAdapter {
  private channels = new Map<string, RealtimeChannel>()

  private constructor(private client: Realtime) {}

  static async create(
    options: AblyAdapterOptions,
  ): Promise<AblyRealtimeAdapter> {
    const Ably = await import('ably')

    const client = new Ably.Realtime({
      key: options.apiKey,
    })

    return new AblyRealtimeAdapter(client)
  }

  async publish(
    channel: string,
    event: string,
    data: RealtimePayload,
  ): Promise<void> {
    const ch = this.getOrCreateChannel(channel)

    await ch.publish(event, data)
  }

  subscribe(
    channel: string,
    event: string,
    handler: (data: RealtimePayload) => void,
  ): Unsubscribe {
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

    await ch.detach()

    this.channels.delete(channel)
  }

  async disconnect(): Promise<void> {
    await Promise.all(
      [...this.channels.keys()].map((ch) => this.unsubscribe(ch)),
    )

    this.client.close()
  }

  private getOrCreateChannel(channel: string): RealtimeChannel {
    const existing = this.channels.get(channel)

    if (existing) {
      return existing
    }

    const ch = this.client.channels.get(channel)

    this.channels.set(channel, ch)

    return ch
  }
}