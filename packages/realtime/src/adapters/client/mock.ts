import type {
  RealtimeClientAdapter,
  RealtimePayload,
  Unsubscribe,
} from '../../types'

type Handler = (data: RealtimePayload) => void

/**
 * Adaptador **client-side** de mock para testes.
 *
 * Expõe `simulateEvent` para que testes possam disparar eventos manualmente
 * e validar o comportamento dos componentes React / React Native.
 *
 * @example
 * ```ts
 * const adapter = new MockClientAdapter()
 * render(<SalaScreen realtimeAdapter={adapter} />)
 *
 * act(() => {
 *   adapter.simulateEvent('sala:42', 'voto:registrado', { valor: 5 })
 * })
 *
 * expect(screen.getByText('Votos: 1')).toBeInTheDocument()
 * ```
 */
export class MockClientAdapter implements RealtimeClientAdapter {
  private listeners = new Map<string, Map<string, Set<Handler>>>()

  subscribe(channel: string, event: string, handler: Handler): Unsubscribe {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Map())
    }
    const byChannel = this.listeners.get(channel)!

    if (!byChannel.has(event)) {
      byChannel.set(event, new Set())
    }
    byChannel.get(event)!.add(handler)

    return () => {
      byChannel.get(event)?.delete(handler)
    }
  }

  disconnect(): void {
    this.listeners.clear()
  }

  /**
   * Simula a chegada de um evento — use em testes de componentes.
   */
  simulateEvent(channel: string, event: string, data: RealtimePayload): void {
    this.listeners.get(channel)?.get(event)?.forEach((h) => h(data))
    this.listeners.get(channel)?.get('*')?.forEach((h) => h(data))
  }
}
