import { EventEmitter } from 'events'
import type {
  RealtimeAdapter,
  RealtimePayload,
  Unsubscribe,
  WebSocketAdapterOptions,
} from '../types'

// `ws` é a implementação de WebSocket para Node.js
// O consumidor é responsável por instalar o pacote `ws`
type WS = import('ws')
type WSServer = import('ws').WebSocketServer

interface InternalMessage {
  channel: string
  event: string
  data: RealtimePayload
}

/**
 * Adaptador server-side para **WebSocket nativo** (biblioteca `ws`).
 *
 * Implementa um servidor WebSocket embutido que:
 * - Aceita conexões de clientes (React Native, Next.js)
 * - Faz broadcast de eventos por canal usando um EventEmitter interno
 * - Permite subscribe/unsubscribe de handlers no próprio processo
 *
 * Ideal para **produção com infraestrutura própria** do NAC, sem
 * dependência de serviços externos pagos.
 *
 * ## Variáveis de ambiente esperadas
 * ```
 * REALTIME_PROVIDER=websocket
 * WS_URL=ws://0.0.0.0:4001
 * ```
 *
 * ## Protocolo de mensagem (JSON)
 * ```json
 * { "channel": "sala:42", "event": "user:joined", "data": { ... } }
 * ```
 */
export class WebSocketRealtimeAdapter implements RealtimeAdapter {
  private wss: WSServer | null = null
  private emitter = new EventEmitter()
  private options: Required<WebSocketAdapterOptions>

  constructor(options: WebSocketAdapterOptions) {
    this.options = {
      autoReconnect: true,
      reconnectInterval: 3000,
      ...options,
    }

    this.initServer()
  }

  private initServer(): void {
    const { WebSocketServer } = require('ws') as typeof import('ws')
    const url = new URL(this.options.url)
    const port = Number(url.port) || 4001

    this.wss = new WebSocketServer({ port })

    this.wss.on('connection', (socket: WS) => {
      socket.on('message', (raw: Buffer) => {
        try {
          const msg = JSON.parse(raw.toString()) as InternalMessage
          // Repassa eventos recebidos de clientes para o EventEmitter interno
          this.emitter.emit(`${msg.channel}:${msg.event}`, msg.data)
        } catch {
          // Mensagem malformada — ignora silenciosamente
        }
      })
    })

    this.wss.on('error', (err) => {
      console.error('[WebSocketRealtimeAdapter] server error:', err)
    })
  }

  async publish(channel: string, event: string, data: RealtimePayload): Promise<void> {
    if (!this.wss) return

    const message = JSON.stringify({ channel, event, data } satisfies InternalMessage)

    // Faz broadcast para todos os clientes conectados
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1 /* OPEN */) {
        client.send(message)
      }
    })

    // Também dispara no EventEmitter para handlers server-side
    this.emitter.emit(`${channel}:${event}`, data)
  }

  subscribe(channel: string, event: string, handler: (data: RealtimePayload) => void): Unsubscribe {
    const key = `${channel}:${event}`
    this.emitter.on(key, handler)

    return () => {
      this.emitter.off(key, handler)
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    // Remove todos os listeners cujo prefixo começa com `channel:`
    const events = this.emitter.eventNames() as string[]
    events
      .filter((e) => e.startsWith(`${channel}:`))
      .forEach((e) => this.emitter.removeAllListeners(e))
  }

  async disconnect(): Promise<void> {
    this.emitter.removeAllListeners()

    await new Promise<void>((resolve, reject) => {
      if (!this.wss) return resolve()
      this.wss.close((err) => (err ? reject(err) : resolve()))
    })

    this.wss = null
  }

  /** Número de clientes WebSocket conectados — útil para métricas */
  get connectedClients(): number {
    return this.wss?.clients.size ?? 0
  }
}
