// ─────────────────────────────────────────────────────────────────────────────
// @mobiliza/realtime — tipos centrais
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dados brutos que trafegam por um evento de realtime.
 * Mantido como `unknown` para forçar validação no consumidor.
 */
export type RealtimePayload = unknown

/**
 * Função de cancelamento de inscrição retornada por `subscribe`.
 * Chamar cancela o listener e libera os recursos associados.
 */
export type Unsubscribe = () => void | Promise<void>

// ─── Interface server-side ────────────────────────────────────────────────────

/**
 * Contrato que todo adaptador **server-side** deve implementar.
 *
 * O backend (pacote `api`) importa apenas essa interface — nunca o
 * adaptador concreto — o que garante total desacoplamento do provedor.
 *
 * Ciclo típico:
 *   1. `publish`  — emite um evento para um canal
 *   2. `subscribe` — ouve eventos chegando em um canal (ex.: webhooks internos)
 *   3. `unsubscribe` — remove todas as inscrições de um canal
 *   4. `disconnect` — encerra a conexão com o provedor
 */
export interface RealtimeAdapter {
  /**
   * Publica `data` no `channel` sob o nome de evento `event`.
   *
   * @param channel  Identificador do canal (ex.: `"presence:sala-42"`)
   * @param event    Nome do evento (ex.: `"user:joined"`)
   * @param data     Payload arbitrário — será serializado pelo adaptador
   */
  publish(channel: string, event: string, data: RealtimePayload): Promise<void>

  /**
   * Registra um `handler` para eventos `event` no `channel`.
   *
   * @returns Função de cancelamento — chame-a para parar de ouvir
   */
  subscribe(
    channel: string,
    event: string,
    handler: (data: RealtimePayload) => void,
  ): Unsubscribe

  /**
   * Remove **todas** as inscrições associadas a `channel`.
   * Útil ao encerrar uma sala ou sessão específica.
   */
  unsubscribe(channel: string): Promise<void>

  /**
   * Encerra completamente a conexão com o provedor.
   * Deve ser chamado no shutdown gracioso do servidor.
   */
  disconnect(): Promise<void>
}

// ─── Interface client-side ────────────────────────────────────────────────────

/**
 * Contrato que todo adaptador **client-side** deve implementar.
 *
 * Usado pelo app React Native e pelo frontend Next.js para receber
 * eventos em tempo real sem depender de um SDK específico.
 *
 * O client-side não publica diretamente — mutações passam pela API REST.
 * (Caso seja necessário no futuro, `publish` pode ser adicionado aqui.)
 */
export interface RealtimeClientAdapter {
  /**
   * Inscreve-se em eventos `event` do `channel`.
   *
   * @returns Função de cancelamento
   */
  subscribe(
    channel: string,
    event: string,
    handler: (data: RealtimePayload) => void,
  ): Unsubscribe

  /**
   * Encerra todas as conexões ativas do cliente.
   * Chame ao desmontar a aplicação ou fazer logout.
   */
  disconnect(): void
}

// ─── Opções de configuração por adaptador ────────────────────────────────────

export interface SupabaseAdapterOptions {
  url: string
  anonKey: string
}

export interface AblyAdapterOptions {
  apiKey: string
  /** Ambiente (padrão: `"production"`) */
  environment?: string
}

export interface WebSocketAdapterOptions {
  /** URL completa do servidor WS, ex.: `"ws://localhost:4001"` */
  url: string
  /** Reconectar automaticamente ao perder conexão (padrão: `true`) */
  autoReconnect?: boolean
  /** Intervalo em ms entre tentativas de reconexão (padrão: `3000`) */
  reconnectInterval?: number
}

export interface PusherAdapterOptions {
  appId: string
  key: string
  secret: string
  cluster: string
}

// ─── Tipo-chave do provider ───────────────────────────────────────────────────

export type RealtimeProvider = 'supabase' | 'ably' | 'websocket' | 'pusher' | 'mock'
