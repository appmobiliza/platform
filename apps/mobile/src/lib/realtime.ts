/**
 * Singleton do adaptador de realtime **client-side** para o app mobile.
 *
 * Cria o adaptador uma única vez a partir das credenciais obtidas do
 * endpoint genérico `/api/realtime/credentials` do servidor.
 *
 * O cliente nunca precisa saber qual provedor está sendo usado (Ably,
 * Supabase, WebSocket, etc.) — ele recebe `{ provider, config }` do
 * servidor e o `@mobiliza/realtime` resolve o adaptador correto.
 *
 * Uso:
 * ```ts
 * import { getRealtimeClient } from "@/lib/realtime";
 *
 * useEffect(() => {
 *   getRealtimeClient().then(client => {
 *     const unsub = client.subscribe("channel", "event", handler);
 *     // ...
 *   });
 * }, []);
 * ```
 */

import {
	type ClientCredentials,
	createClientFromCredentials,
	type RealtimeClientAdapter,
} from "@mobiliza/realtime/client";

// ─── Singleton assíncrono ─────────────────────────────────────────────────────

let _instance: RealtimeClientAdapter | null = null;
let _initializing: Promise<RealtimeClientAdapter> | null = null;
let _usingMock = false;

async function fetchCredentials(): Promise<ClientCredentials> {
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;

	if (!apiUrl) {
		console.warn(
			"[realtime] EXPO_PUBLIC_API_URL não definida. Usando mock.",
		);
		_usingMock = true;
		return { provider: "mock", config: {} };
	}

	try {
		const baseUrl = apiUrl.replace(/\/+$/, "");
		const response = await fetch(`${baseUrl}/api/realtime/credentials`, {
			credentials: "include",
		});

		if (!response.ok) {
			console.warn(
				`[realtime] Falha ao buscar credenciais (${response.status}). Usando mock.`,
			);
			_usingMock = true;
			return { provider: "mock", config: {} };
		}

		_usingMock = false;
		return (await response.json()) as ClientCredentials;
	} catch (error) {
		console.error("[realtime] Erro ao buscar credenciais:", error);
		_usingMock = true;
		return { provider: "mock", config: {} };
	}
}

/**
 * Indica se o cliente de realtime está operando em modo mock
 * (por falha na obtenção de credenciais ou URL não configurada).
 */
export function isUsingMockClient(): boolean {
	return _usingMock;
}

/**
 * Retorna a instância do adaptador de realtime, criando-a sob demanda
 * na primeira chamada. A criação é assíncrona — busca as credenciais
 * no servidor via `/api/realtime/credentials`.
 *
 * Chamadas concorrentes durante a inicialização aguardam a mesma promise.
 */
export async function getRealtimeClient(): Promise<RealtimeClientAdapter> {
	if (_instance) return _instance;

	if (!_initializing) {
		_initializing = (async () => {
			const credentials = await fetchCredentials();
			_instance = await createClientFromCredentials(credentials);
			return _instance;
		})();
	}

	return _initializing;
}

/**
 * Encerra a conexão de realtime e libera os recursos.
 * Deve ser chamado ao fazer logout ou quando o app entra em background.
 */
export function disconnectRealtime(): void {
	if (_instance) {
		_instance.disconnect();
		_instance = null;
	}
	_initializing = null;
	_usingMock = false;
}
