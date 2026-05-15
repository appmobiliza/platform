import type {
  RealtimeAdapter,
  RealtimePayload,
  Unsubscribe,
} from '../types'

type Handler = (data: RealtimePayload) => void

/**
 * Adaptador de mock para testes e desenvolvimento local.
 *
 * Não faz conexões externas. Mantém um bus em memória que permite
 * testar fluxos de publish/subscribe sem nenhum provedor real.
 *
 * @example
 * ```ts
 * const adapter = new MockRealtimeAdapter()
 * const unsub = adapter.subscribe('sala:1', 'user:joined', console.log)
 * await adapter.publish('sala:1', 'user:joined', { userId: 'abc' })
 * // → { userId: 'abc' }
 * unsub()
 * ```
 */
export class MockRealtimeAdapter implements RealtimeAdapter {
  /** Canal → evento → lista de handlers */
  private listeners = new Map<string, Map<string, Set<Handler>>>()

  /** Histórico de publicações — útil para assertions em testes */
  public published: Array<{ channel: string; event: string; data: RealtimePayload }> = []

  async publish(channel: string, event: string, data: RealtimePayload): Promise<void> {
    this.published.push({ channel, event, data })

    const channelListeners = this.listeners.get(channel)
    if (!channelListeners) return

    // Ouve handlers registrados para este evento específico
    channelListeners.get(event)?.forEach((handler) => handler(data))

    // Ouve handlers registrados para o wildcard '*'
    channelListeners.get('*')?.forEach((handler) => handler(data))
  }

  subscribe(channel: string, event: string, handler: Handler): Unsubscribe {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Map())
    }

    const channelListeners = this.listeners.get(channel)!

    if (!channelListeners.has(event)) {
      channelListeners.set(event, new Set())
    }

    channelListeners.get(event)!.add(handler)

    return () => {
      channelListeners.get(event)?.delete(handler)
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    this.listeners.delete(channel)
  }

  async disconnect(): Promise<void> {
    this.listeners.clear()
    this.published = []
  }

  /** Limpa o histórico de publicações entre testes */
  clearPublished(): void {
    this.published = []
  }

  /** Retorna quantos handlers estão registrados em um canal/evento */
  listenerCount(channel: string, event: string): number {
    return this.listeners.get(channel)?.get(event)?.size ?? 0
  }
}
