import Ably from "ably";

import type {
	AblyClientAdapterOptions,
	RealtimeClientAdapter,
	RealtimePayload,
	Unsubscribe,
} from "../../types";

// Tipos lazy — o pacote `ably` só é carregado se este adaptador for usado
type AblyRealtimeInstance = import("ably").Realtime;
type AblyChannel = import("ably").RealtimeChannel;
type AblyMessage = import("ably").Message;

type Handler = (data: RealtimePayload) => void;

/**
 * Adaptador **client-side** para o **Ably Realtime**.
 *
 * Compatível com React Native e browser. O SDK do Ably (`ably`) funciona
 * em ambos os ambientes sem polyfills adicionais.
 *
 * ## Autenticação
 *
 * O client-side nunca deve receber a API key completa — ela contém o secret
 * e exporia credenciais de escrita ao usuário final. Use uma das opções:
 *
 * ### Opção A — `authUrl` (recomendado para produção)
 * Aponte para um endpoint da sua API que retorna um Ably Token Request.
 * O SDK renova o token automaticamente antes da expiração.
 *
 * ```ts
 * // No servidor (router tRPC ou rota Hono)
 * app.get('/api/ably-token', async (c) => {
 *   const session = await getSession(c)
 *   const tokenRequest = await ablyServer.auth.createTokenRequest({
 *     clientId: session.user.id,
 *     capability: { '*': ['subscribe'] }, // somente leitura para clientes
 *   })
 *   return c.json(tokenRequest)
 * })
 *
 * // No cliente
 * const adapter = new AblyClientAdapter({
 *   authUrl: `${API_URL}/api/ably-token`,
 *   clientId: session.user.id,
 * })
 * ```
 *
 * ### Opção B — `clientToken` (aceitável para protótipos)
 * Gere um token no servidor e passe diretamente. Expira e não é renovado
 * automaticamente — use apenas para demos ou ambientes de desenvolvimento.
 *
 * ```ts
 * const token = await ablyServer.auth.requestToken({ clientId: userId })
 * const adapter = new AblyClientAdapter({ clientToken: token.token })
 * ```
 *
 * ## Uso em um hook React / React Native
 *
 * ```ts
 * const adapter = new AblyClientAdapter({ authUrl: `${API_URL}/api/ably-token` })
 *
 * useEffect(() => {
 *   const unsub = adapter.subscribe('request:42', 'request:accepted', (data) => {
 *     setStatus('accepted')
 *   })
 *   return unsub
 * }, [requestId])
 *
 * // Na desmontagem do app / logout:
 * adapter.disconnect()
 * ```
 *
 * @see https://ably.com/docs/auth/token
 * @see https://ably.com/docs/getting-started/react
 */
export class AblyClientAdapter implements RealtimeClientAdapter {
	private client: AblyRealtimeInstance;

	async publish(
		channel: string,
		event: string,
		data: RealtimePayload,
	): Promise<void> {
		const ch = this.getOrCreateChannel(channel);
		ch.publish(event, data);
	}

	/**
	 * Canal → evento → Set de handlers registrados.
	 * Mantido separado do objeto de canal do Ably para permitir
	 * cancelamento granular por handler (o Ably cancela por referência).
	 */
	private subscriptions = new Map<string, Map<string, Set<Handler>>>();

	/** Cache de canais abertos para evitar `.get()` redundante */
	private channels = new Map<string, AblyChannel>();

	constructor(options: AblyClientAdapterOptions) {
		// Ably runtime rejeita `undefined` para `clientId`,
		// mas os tipos aceitam. Só passamos se for fornecida.
		const realtimeOptions: Record<string, unknown> = {
			environment: options.environment,
		};

		if (options.clientId !== undefined) {
			realtimeOptions.clientId = options.clientId;
		}

		if (options.clientToken) {
			realtimeOptions.token = options.clientToken;
		} else {
			realtimeOptions.authUrl = options.authUrl;
		}

		this.client = new (Ably as any).Realtime(realtimeOptions);

		this.client.connection.on("failed", (stateChange) => {
			console.error(
				"[AblyClientAdapter] conexão falhou:",
				stateChange.reason,
			);
		});
	}

	subscribe(channel: string, event: string, handler: Handler): Unsubscribe {
		const ch = this.getOrCreateChannel(channel);

		// Handler wrapper que extrai apenas o payload — a assinatura do Ably
		// entrega um objeto Message completo; o contrato do adaptador entrega
		// apenas os dados brutos.
		const ablyHandler = (message: AblyMessage) => {
			handler(message.data as RealtimePayload);
		};

		ch.subscribe(event, ablyHandler);

		// Registra no mapa interno para rastreamento
		if (!this.subscriptions.has(channel)) {
			this.subscriptions.set(channel, new Map());
		}
		const byChannel = this.subscriptions.get(channel)!;
		if (!byChannel.has(event)) {
			byChannel.set(event, new Set());
		}
		byChannel.get(event)?.add(handler);

		return () => {
			// Cancela apenas este handler específico no Ably
			ch.unsubscribe(event, ablyHandler);

			// Remove do mapa interno
			byChannel.get(event)?.delete(handler);

			// Se não há mais handlers neste evento, limpa a entrada
			if (byChannel.get(event)?.size === 0) {
				byChannel.delete(event);
			}

			// Se não há mais eventos neste canal, desanexa o canal do Ably
			if (byChannel.size === 0) {
				this.subscriptions.delete(channel);
				ch.detach();
				this.channels.delete(channel);
			}
		};
	}

	disconnect(): void {
		// Desanexa todos os canais antes de fechar a conexão
		this.channels.forEach((ch) => {
			ch.unsubscribe();
			ch.detach();
		});
		this.channels.clear();
		this.subscriptions.clear();
		this.client.close();
	}

	/**
	 * Estado atual da conexão com o Ably.
	 * Útil para exibir indicadores de conectividade na UI.
	 *
	 * Valores possíveis: `'initialized'` | `'connecting'` | `'connected'` |
	 * `'disconnected'` | `'suspended'` | `'closing'` | `'closed'` | `'failed'`
	 */
	get connectionState(): string {
		return this.client.connection.state;
	}

	/**
	 * Registra um callback para mudanças de estado da conexão.
	 * Útil para mostrar banners de "sem conexão" na UI.
	 *
	 * @returns Função de cancelamento
	 *
	 * @example
	 * ```ts
	 * const unsub = adapter.onConnectionStateChange((state) => {
	 *   setIsConnected(state === 'connected')
	 * })
	 * return unsub // no cleanup do useEffect
	 * ```
	 */
	onConnectionStateChange(callback: (state: string) => void): Unsubscribe {
		const listener = (stateChange: { current: string }) => {
			callback(stateChange.current);
		};
		this.client.connection.on(listener);
		return () => this.client.connection.off(listener);
	}

	private getOrCreateChannel(channel: string): AblyChannel {
		if (!this.channels.has(channel)) {
			this.channels.set(channel, this.client.channels.get(channel));
		}
		return this.channels.get(channel)!;
	}
}
