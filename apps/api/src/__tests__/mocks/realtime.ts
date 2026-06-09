/**
 * Mock do módulo @mobiliza/realtime
 *
 * Simula o RealtimeAdapter para testes unitários.
 * Todos os métodos são no-ops — não tenta conexão real.
 */

import type {
	ClientCredentials,
	RealtimeAdapter,
	RealtimeClientAdapter,
} from "@mobiliza/realtime";

import { jest } from "@jest/globals";

/**
 * Mock do RealtimeAdapter server-side.
 */
export class MockRealtimeAdapter implements RealtimeAdapter {
	publish = jest.fn(async () => { });
	subscribe = jest.fn(() => {
		return () => { };
	});
	unsubscribe = jest.fn(async () => { });
	disconnect = jest.fn(async () => { });
	getClientCredentials = jest.fn(async (): Promise<ClientCredentials> => ({
		provider: "ably",
		config: {},
	}));
}

/**
 * Mock do RealtimeClientAdapter client-side.
 */
// export class MockClientRealtimeAdapter implements RealtimeClientAdapter {
// subscribe = jest.fn(() => {
// return () => { };
// });
// disconnect = jest.fn(async () => { });
// }

// ─── Factory ──────────────────────────────────────────────────────────────────

let adapterInstance: MockRealtimeAdapter | null = null;

export function createMockRealtimeAdapter(): RealtimeAdapter {
	if (!adapterInstance) {
		adapterInstance = new MockRealtimeAdapter();
	}
	return adapterInstance;
}

/**
 * Mock da factory real do @mobiliza/realtime
 */
export async function createRealtimeAdapter(): Promise<RealtimeAdapter> {
	return createMockRealtimeAdapter();
}

export function resetMockRealtimeAdapter(): void {
	adapterInstance = null;
}

// ─── Re-export types (para uso nos mocks) ─────────────────────────────────────

export type {
	RealtimeAdapter,
	RealtimeClientAdapter,
} from "@mobiliza/realtime";
