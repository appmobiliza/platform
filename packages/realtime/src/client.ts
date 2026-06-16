/**
 * Entrypoint **client-side** do `@mobiliza/realtime`.
 *
 * Exporta a factory `createClientFromCredentials()` que cria o adaptador
 * correto com base nas credenciais obtidas do servidor via
 * `/api/realtime/credentials`.
 *
 * **Cada adaptador concreto é carregado via `import()` dinâmico** — apenas
 * o SDK do provider em uso é bundlado. Se você usa Ably, o Supabase SDK
 * nunca entra no bundle, e vice-versa.
 *
 * Uso no mobile/web:
 * ```ts
 * import { createClientFromCredentials } from "@mobiliza/realtime/client";
 * import type { ClientCredentials } from "@mobiliza/realtime/client";
 *
 * const credentials: ClientCredentials = await fetch("/api/realtime/credentials").then(r => r.json());
 * const client = await createClientFromCredentials(credentials);
 * ```
 */
import type {
	ClientCredentials,
	RealtimeClientAdapter,
} from "./types";

export { MockClientAdapter } from "./adapters/client/mock";
export type {
	AblyAdapterOptions,
	AblyClientAdapterOptions,
	ClientCredentials,
	PusherAdapterOptions,
	RealtimeClientAdapter,
	RealtimePayload,
	RealtimeProvider,
	SupabaseAdapterOptions,
	Unsubscribe,
	WebSocketAdapterOptions,
} from "./types";

/**
 * Cria o adaptador client-side apropriado com base nas credenciais
 * fornecidas pelo servidor.
 *
 * Apenas o módulo do provider selecionado é carregado — os demais
 * permanecem em chunks separados e nunca são avaliados.
 *
 * @param credentials Credenciais obtidas de `/api/realtime/credentials`
 */
export async function createClientFromCredentials(
	credentials: ClientCredentials,
): Promise<RealtimeClientAdapter> {
	switch (credentials.provider) {
		case "ably": {
			const clientToken = credentials.config.clientToken;
			const authUrl = credentials.config.authUrl;

			if (!clientToken && !authUrl) {
				const { MockClientAdapter } = await import(
					"./adapters/client/mock"
				);
				return new MockClientAdapter();
			}

			const { AblyClientAdapter } = await import(
				"./adapters/client/ably"
			);
			return new AblyClientAdapter({ clientToken, authUrl });
		}

		case "supabase": {
			const url = credentials.config.url;
			const anonKey = credentials.config.anonKey;

			if (!url || !anonKey) {
				const { MockClientAdapter } = await import(
					"./adapters/client/mock"
				);
				return new MockClientAdapter();
			}

			const { SupabaseClientAdapter } = await import(
				"./adapters/client/supabase"
			);
			return new SupabaseClientAdapter({ url, anonKey });
		}

		case "websocket": {
			const { WebSocketClientAdapter } = await import(
				"./adapters/client/websocket"
			);
			const url = credentials.config.url ?? "ws://localhost:4001";
			return new WebSocketClientAdapter({ url });
		}

		default: {
			const { MockClientAdapter } = await import(
				"./adapters/client/mock"
			);
			return new MockClientAdapter();
		}
	}
}
