import type {
  RealtimeClientAdapter,
  RealtimePayload,
  Unsubscribe,
  WebSocketAdapterOptions,
} from '../../types'

interface InternalMessage {
  channel: string
  event: string
  data: RealtimePayload
}

type Handler = (data: RealtimePayload) => void

/**
 * Adaptador **client-side** para WebSocket nativo.
 *
 * Compatível com React Native e browser — usa a API `WebSocket` global,
 * disponível em ambos os ambientes sem dependências extras.
 *
 * Implementa reconexão automática com backoff linear.
 *
 * @example
 * ```ts
 * const adapter = new WebSocketClientAdapter({ url: 'ws://10.0.2.2:4001' })
 *
 * const unsub = adapter.subscribe('sala:42', 'user:joined', (data) => {
 *   console.log('novo participante:', data)
 * })
 *
 * // Na desmontagem do componente:
 * adapter.disconnect()
 * ```
 */
export class WebSocketClientAdapter implements RealtimeClientAdapter {
  private ws: WebSocket | null = null
  private options: Required<WebSocketAdapterOptions>
  private listeners = new Map<string, Map<string, Set<Handler>>>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private intentionalDisconnect = false

  constructor(options: WebSocketAdapterOptions) {
    this.options = {
      autoReconnect: true,
      reconnectInterval: 3000,
      ...options,
    }
    this.connect()
  }

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
    this.intentionalDisconnect = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.ws?.close()
    this.ws = null
    this.listeners.clear()
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.options.url)
    } catch (err) {
      console.error('[WebSocketClientAdapter] falha ao conectar:', err)
      this.scheduleReconnect()
      return
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as InternalMessage
        this.dispatch(msg)
      } catch {
        // Mensagem malformada — ignora
      }
    }

    this.ws.onclose = () => {
      if (!this.intentionalDisconnect && this.options.autoReconnect) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (err) => {
      console.error('[WebSocketClientAdapter] erro:', err)
    }
  }

  private dispatch(msg: InternalMessage): void {
    const byChannel = this.listeners.get(msg.channel)
    if (!byChannel) return

    byChannel.get(msg.event)?.forEach((h) => h(msg.data))
    byChannel.get('*')?.forEach((h) => h(msg.data))
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, this.options.reconnectInterval)
  }
}
