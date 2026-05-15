import type {
  RealtimeAdapter,
  RealtimePayload,
  PusherAdapterOptions,
  Unsubscribe,
} from '../types'

// `pusher` (server SDK) é instalado apenas quando REALTIME_PROVIDER=pusher
type PusherServer = import('pusher')

/**
 * Adaptador server-side para **Pusher Channels**.
 *
 * O Pusher tem um free tier generoso (200k mensagens/dia, 100 conexões
 * simultâneas) e é simples de integrar — boa opção para demos acadêmicas.
 *
 * **Nota**: O Pusher server-side só publica; não suporta subscribe nativo
 * no servidor. O `subscribe` aqui usa um EventEmitter local — eventos
 * externos precisam chegar via webhook configurado no dashboard do Pusher.
 *
 * ## Variáveis de ambiente esperadas
 * ```
 * REALTIME_PROVIDER=pusher
 * PUSHER_APP_ID=1234567
 * PUSHER_KEY=abcdef123456
 * PUSHER_SECRET=secret
 * PUSHER_CLUSTER=us2
 * ```
 *
 * @see https://pusher.com/docs/channels/server_api/
 */
export class PusherRealtimeAdapter implements RealtimeAdapter {
  private pusher: PusherServer
  private localListeners = new Map<string, Map<string, Set<(data: RealtimePayload) => void>>>()

  constructor(options: PusherAdapterOptions) {
    const Pusher = require('pusher') as typeof import('pusher')
    this.pusher = new Pusher({
      appId: options.appId,
      key: options.key,
      secret: options.secret,
      cluster: options.cluster,
      useTLS: true,
    })
  }

  async publish(channel: string, event: string, data: RealtimePayload): Promise<void> {
    await this.pusher.trigger(channel, event, data as object)

    // Notifica listeners locais (server-side)
    this.localListeners.get(channel)?.get(event)?.forEach((h) => h(data))
  }

  subscribe(channel: string, event: string, handler: (data: RealtimePayload) => void): Unsubscribe {
    if (!this.localListeners.has(channel)) {
      this.localListeners.set(channel, new Map())
    }
    const byChannel = this.localListeners.get(channel)!

    if (!byChannel.has(event)) {
      byChannel.set(event, new Set())
    }
    byChannel.get(event)!.add(handler)

    return () => {
      byChannel.get(event)?.delete(handler)
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    this.localListeners.delete(channel)
  }

  async disconnect(): Promise<void> {
    this.localListeners.clear()
    // Pusher HTTP API não mantém conexão persistente — nada a fechar
  }
}
